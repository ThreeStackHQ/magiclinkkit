export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { twofaEnrollments, twofaEvents } from "@magiclinkkit/db";
import { and, eq } from "drizzle-orm";
import { fireWebhook } from "@/lib/webhooks";

async function handler(
  req: NextRequest,
  ctx: { workspaceId: string },
  userId: string
): Promise<NextResponse> {
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
      { status: "fail", message: "No active 2FA enrollment found" },
      { status: 404 }
    );
  }

  await db
    .update(twofaEnrollments)
    .set({ isEnabled: false })
    .where(eq(twofaEnrollments.id, enrollment.id));

  await db.insert(twofaEvents).values({
    workspaceId: ctx.workspaceId,
    endUserId: userId,
    eventType: "disabled",
    ipAddress:
      req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
  });

  fireWebhook(ctx.workspaceId, "disabled", { userId });

  return NextResponse.json({
    status: "success",
    data: { disabled: true },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  const { userId } = params;
  return withApiKey(req, (r, c) => handler(r, c, userId));
}
