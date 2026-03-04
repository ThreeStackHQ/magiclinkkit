export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { twofaEnrollments, twofaEvents } from "@twofakit/db";
import { and, eq } from "drizzle-orm";

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

  // Generate new backup codes
  const plaintextCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < 10; i++) {
    const code = randomBytes(4).toString("hex");
    plaintextCodes.push(code);
    const hash = await bcrypt.hash(code, 10);
    hashedCodes.push(hash);
  }

  await db
    .update(twofaEnrollments)
    .set({ backupCodes: hashedCodes })
    .where(eq(twofaEnrollments.id, enrollment.id));

  await db.insert(twofaEvents).values({
    workspaceId: ctx.workspaceId,
    endUserId: userId,
    eventType: "backup_regenerated",
    ipAddress:
      req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
  });

  return NextResponse.json({
    status: "success",
    data: { backupCodes: plaintextCodes },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  const { userId } = params;
  return withApiKey(req, (r, c) => handler(r, c, userId));
}
