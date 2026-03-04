export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { otpCodes, auditLog, workspaces, generateOtp } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";
import { rateLimitOtp, RateLimitError } from "@/lib/ratelimit";
import { checkAndIncrementAuth, QuotaExceededError } from "@/lib/tier";
import { sendOtpEmail } from "@/lib/resend";

const SendSchema = z.object({
  email: z.string().email().max(255),
});

async function handler(
  req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const result = SendSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { email } = result.data;

    await rateLimitOtp(email, ctx.workspaceId);
    await checkAndIncrementAuth(ctx.workspaceId);

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    await db.insert(otpCodes).values({
      workspaceId: ctx.workspaceId,
      email,
      code,
      expiresAt,
      ipAddress,
    });

    const [workspace] = await db
      .select({ name: workspaces.name })
      .from(workspaces)
      .where(eq(workspaces.id, ctx.workspaceId))
      .limit(1);

    await sendOtpEmail(email, code, workspace?.name ?? "App");

    await db.insert(auditLog).values({
      workspaceId: ctx.workspaceId,
      event: "otp.sent",
      email,
      ipAddress,
    });

    return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
