export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { magicLinks, auditLog, workspaces, generateToken } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";
import { rateLimitMagicLink, RateLimitError } from "@/lib/ratelimit";
import { checkAndIncrementAuth, QuotaExceededError } from "@/lib/tier";
import { sendMagicLinkEmail } from "@/lib/resend";
import { fireWebhook } from "@/lib/webhooks";

const SendSchema = z.object({
  email: z.string().email().max(255),
  redirect_url: z.string().url().max(2048).optional(),
  metadata: z.record(z.unknown()).optional(),
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

    const { email, redirect_url, metadata } = result.data;

    await rateLimitMagicLink(email, ctx.workspaceId);
    await checkAndIncrementAuth(ctx.workspaceId);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/magic-link/verify?token=${token}`;

    await db.insert(magicLinks).values({
      workspaceId: ctx.workspaceId,
      email,
      token,
      expiresAt,
      redirectUrl: redirect_url ?? null,
      metadata: metadata ?? null,
      ipAddress,
    });

    const [workspace] = await db
      .select({ name: workspaces.name })
      .from(workspaces)
      .where(eq(workspaces.id, ctx.workspaceId))
      .limit(1);

    await sendMagicLinkEmail(email, verifyUrl, workspace?.name ?? "App");

    await db.insert(auditLog).values({
      workspaceId: ctx.workspaceId,
      event: "magic_link.sent",
      email,
      ipAddress,
    });

    fireWebhook(ctx.workspaceId, "magic_link.sent", { email }).catch(() => {});

    return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }
    console.error("Magic link send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
