export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { twofaEnrollments } from "@magiclinkkit/db";
import { and, eq } from "drizzle-orm";

async function handler(
  req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { status: "fail", message: "userId query parameter is required" },
      { status: 400 }
    );
  }

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

  return NextResponse.json({
    status: "success",
    data: {
      enrolled: !!enrollment,
      enrolledAt: enrollment?.enrolledAt?.toISOString() ?? null,
      lastVerifiedAt: enrollment?.lastVerifiedAt?.toISOString() ?? null,
    },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
