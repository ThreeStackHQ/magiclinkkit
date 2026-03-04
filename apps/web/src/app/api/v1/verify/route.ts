export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import speakeasy from "speakeasy";
import bcrypt from "bcrypt";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { checkQuota, QuotaExceededError } from "@/lib/tier";
import { verifyRateLimit, RateLimitError } from "@/lib/ratelimit";
import { twofaEnrollments, twofaEvents } from "@magiclinkkit/db";
import { decrypt } from "@magiclinkkit/db";
import { and, eq } from "drizzle-orm";
import { fireWebhook } from "@/lib/webhooks";

const VerifySchema = z.object({
  userId: z.string().min(1).max(255),
  token: z.string().min(6).max(8),
});

async function handler(
  req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const result = VerifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "Invalid input" },
        { status: 422 }
      );
    }

    const { userId, token } = result.data;

    // Rate limit
    try {
      verifyRateLimit(userId, ctx.workspaceId);
    } catch (e: unknown) {
      if (e instanceof RateLimitError) {
        return NextResponse.json(
          { status: "fail", message: e.message },
          { status: 429 }
        );
      }
      throw e;
    }

    // Quota check
    try {
      await checkQuota(ctx.workspaceId);
    } catch (e: unknown) {
      if (e instanceof QuotaExceededError) {
        return NextResponse.json(
          { status: "fail", message: e.message },
          { status: 402 }
        );
      }
      throw e;
    }

    const encryptionKey = process.env.TWOFAKIT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return NextResponse.json(
        { status: "fail", message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Find enrollment
    const [enrollment] = await db
      .select()
      .from(twofaEnrollments)
      .where(
        and(
          eq(twofaEnrollments.workspaceId, ctx.workspaceId),
          eq(twofaEnrollments.endUserId, userId),
          eq(twofaEnrollments.isEnabled, true)
        )
      )
      .limit(1);

    if (!enrollment) {
      return NextResponse.json(
        { status: "fail", message: "2FA not enrolled for this user" },
        { status: 404 }
      );
    }

    // Decrypt secret
    const encryptedData = JSON.parse(enrollment.secretEncrypted) as {
      iv: string;
      tag: string;
      encrypted: string;
    };
    const secret = decrypt(
      encryptedData.encrypted,
      encryptedData.iv,
      encryptedData.tag,
      encryptionKey
    );

    // Try TOTP verify
    const totpValid = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    const ipAddress =
      req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");

    if (totpValid) {
      await db
        .update(twofaEnrollments)
        .set({ lastVerifiedAt: new Date() })
        .where(eq(twofaEnrollments.id, enrollment.id));

      await db.insert(twofaEvents).values({
        workspaceId: ctx.workspaceId,
        endUserId: userId,
        eventType: "verified",
        metadata: { method: "totp" },
        ipAddress,
      });

      return NextResponse.json({
        status: "success",
        data: { valid: true, method: "totp" },
      });
    }

    // Try backup codes
    const backupCodes = (enrollment.backupCodes ?? []) as string[];
    let backupIndex = -1;

    for (let i = 0; i < backupCodes.length; i++) {
      const isMatch = await bcrypt.compare(token, backupCodes[i]);
      if (isMatch) {
        backupIndex = i;
        break;
      }
    }

    if (backupIndex >= 0) {
      // Remove used backup code
      const updatedCodes = [...backupCodes];
      updatedCodes.splice(backupIndex, 1);

      await db
        .update(twofaEnrollments)
        .set({
          backupCodes: updatedCodes,
          lastVerifiedAt: new Date(),
        })
        .where(eq(twofaEnrollments.id, enrollment.id));

      await db.insert(twofaEvents).values({
        workspaceId: ctx.workspaceId,
        endUserId: userId,
        eventType: "backup_used",
        metadata: { remainingBackups: updatedCodes.length },
        ipAddress,
      });

      return NextResponse.json({
        status: "success",
        data: {
          valid: true,
          method: "backup",
          remainingBackups: updatedCodes.length,
        },
      });
    }

    // Failed verification
    await db.insert(twofaEvents).values({
      workspaceId: ctx.workspaceId,
      endUserId: userId,
      eventType: "verify_failed",
      ipAddress,
    });

    // Count recent failures for webhook
    const recentFailures = await db
      .select()
      .from(twofaEvents)
      .where(
        and(
          eq(twofaEvents.workspaceId, ctx.workspaceId),
          eq(twofaEvents.endUserId, userId),
          eq(twofaEvents.eventType, "verify_failed")
        )
      );

    if (recentFailures.length % 3 === 0) {
      fireWebhook(ctx.workspaceId, "verify_failed", {
        userId,
        failureCount: recentFailures.length,
      });
    }

    return NextResponse.json({
      status: "success",
      data: { valid: false },
    });
  } catch (error: unknown) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
