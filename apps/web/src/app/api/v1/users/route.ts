export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { twofaEnrollments } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";

async function handler(
  _req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  const enrollments = await db
    .select({
      endUserId: twofaEnrollments.endUserId,
      isEnabled: twofaEnrollments.isEnabled,
      enrolledAt: twofaEnrollments.enrolledAt,
      lastVerifiedAt: twofaEnrollments.lastVerifiedAt,
    })
    .from(twofaEnrollments)
    .where(eq(twofaEnrollments.workspaceId, ctx.workspaceId));

  const users = enrollments.map((e: { endUserId: string; isEnabled: boolean; enrolledAt: Date | null; lastVerifiedAt: Date | null }) => ({
    userId: e.endUserId,
    twoFaEnabled: e.isEnabled,
    enrolledAt: e.enrolledAt?.toISOString() ?? null,
    lastVerifiedAt: e.lastVerifiedAt?.toISOString() ?? null,
  }));

  return NextResponse.json({
    status: "success",
    data: { users },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
