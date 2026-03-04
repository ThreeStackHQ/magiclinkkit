export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import speakeasy from "speakeasy";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { twofaEnrollments, twofaEvents } from "@twofakit/db";
import { decrypt } from "@twofakit/db";
import { and, eq } from "drizzle-orm";
import { fireWebhook } from "@/lib/webhooks";

const ConfirmSchema = z.object({
  enrollmentId: z.string().uuid(),
  userId: z.string().min(1).max(255),
  token: z.string().length(6),
});

async function handler(
  req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const result = ConfirmSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "Invalid input", errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { enrollmentId, userId, token } = result.data;
    const encryptionKey = process.env.TWOFAKIT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return NextResponse.json(
        { status: "fail", message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Find pending enrollment
    const [enrollment] = await db
      .select()
      .from(twofaEnrollments)
      .where(
        and(
          eq(twofaEnrollments.id, enrollmentId),
          eq(twofaEnrollments.workspaceId, ctx.workspaceId),
          eq(twofaEnrollments.endUserId, userId),
          eq(twofaEnrollments.isEnabled, false)
        )
      )
      .limit(1);

    if (!enrollment) {
      return NextResponse.json(
        { status: "fail", message: "Enrollment not found or already confirmed" },
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

    // Verify token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!isValid) {
      return NextResponse.json(
        { status: "fail", message: "Invalid token" },
        { status: 400 }
      );
    }

    // Generate backup codes
    const plaintextCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const code = randomBytes(4).toString("hex");
      plaintextCodes.push(code);
      const hash = await bcrypt.hash(code, 10);
      hashedCodes.push(hash);
    }

    // Enable enrollment
    const now = new Date();
    await db
      .update(twofaEnrollments)
      .set({
        isEnabled: true,
        backupCodes: hashedCodes,
        enrolledAt: now,
        lastVerifiedAt: now,
      })
      .where(eq(twofaEnrollments.id, enrollmentId));

    // Log event
    await db.insert(twofaEvents).values({
      workspaceId: ctx.workspaceId,
      endUserId: userId,
      eventType: "enrolled",
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
    });

    // Fire webhook
    fireWebhook(ctx.workspaceId, "enrolled", { userId });

    return NextResponse.json({
      status: "success",
      data: {
        success: true,
        backupCodes: plaintextCodes,
      },
    });
  } catch (error: unknown) {
    console.error("Enroll confirm error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
