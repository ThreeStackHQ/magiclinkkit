export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { otpCodes, auditLog } from "@magiclinkkit/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { signAuthJwt } from "@/lib/jwt";
import { fireWebhook } from "@/lib/webhooks";

const VerifySchema = z.object({
  email: z.string().email().max(255),
  code: z.string().length(6),
});

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function handler(
  req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const result = VerifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { email, code } = result.data;

    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.workspaceId, ctx.workspaceId),
          eq(otpCodes.email, email),
          isNull(otpCodes.usedAt)
        )
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!otp) {
      return NextResponse.json({ error: "No pending OTP found" }, { status: 404 });
    }

    if (new Date() > otp.expiresAt) {
      await db.insert(auditLog).values({
        workspaceId: ctx.workspaceId,
        event: "otp.expired",
        email,
      });
      return NextResponse.json({ error: "OTP expired" }, { status: 410 });
    }

    if (otp.attemptCount >= 3) {
      return NextResponse.json(
        { error: "Too many attempts", attemptsRemaining: 0 },
        { status: 429 }
      );
    }

    if (!safeCompare(code, otp.code)) {
      const newAttempts = otp.attemptCount + 1;
      await db
        .update(otpCodes)
        .set({
          attemptCount: newAttempts,
          ...(newAttempts >= 3 ? { usedAt: new Date() } : {}),
        })
        .where(eq(otpCodes.id, otp.id));

      await db.insert(auditLog).values({
        workspaceId: ctx.workspaceId,
        event: "otp.failed",
        email,
        metadata: { attemptCount: newAttempts },
      });

      return NextResponse.json(
        { error: "Invalid code", attemptsRemaining: Math.max(0, 3 - newAttempts) },
        { status: 401 }
      );
    }

    // Success
    await db
      .update(otpCodes)
      .set({ usedAt: new Date() })
      .where(eq(otpCodes.id, otp.id));

    const jwt = await signAuthJwt({ workspaceId: ctx.workspaceId, email });

    await db.insert(auditLog).values({
      workspaceId: ctx.workspaceId,
      event: "otp.verified",
      email,
    });

    fireWebhook(ctx.workspaceId, "otp.verified", { email }).catch(() => {});

    return NextResponse.json({ token: jwt, email });
  } catch (error: unknown) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
