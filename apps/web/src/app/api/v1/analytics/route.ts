export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { twofaEvents, twofaEnrollments } from "@magiclinkkit/db";
import { and, eq, gte, sql } from "drizzle-orm";

async function handler(
  _req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    verificationsToday,
    verificationsThisMonth,
    successCount,
    failCount,
    enrolledUsers,
    topFailures,
  ] = await Promise.all([
    // Verifications today
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(twofaEvents)
      .where(
        and(
          eq(twofaEvents.workspaceId, ctx.workspaceId),
          eq(twofaEvents.eventType, "verified"),
          gte(twofaEvents.createdAt, startOfDay)
        )
      ),
    // Verifications this month
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(twofaEvents)
      .where(
        and(
          eq(twofaEvents.workspaceId, ctx.workspaceId),
          eq(twofaEvents.eventType, "verified"),
          gte(twofaEvents.createdAt, startOfMonth)
        )
      ),
    // Success count (this month)
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(twofaEvents)
      .where(
        and(
          eq(twofaEvents.workspaceId, ctx.workspaceId),
          eq(twofaEvents.eventType, "verified"),
          gte(twofaEvents.createdAt, startOfMonth)
        )
      ),
    // Fail count (this month)
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(twofaEvents)
      .where(
        and(
          eq(twofaEvents.workspaceId, ctx.workspaceId),
          eq(twofaEvents.eventType, "verify_failed"),
          gte(twofaEvents.createdAt, startOfMonth)
        )
      ),
    // Enrolled users
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(twofaEnrollments)
      .where(
        and(
          eq(twofaEnrollments.workspaceId, ctx.workspaceId),
          eq(twofaEnrollments.isEnabled, true)
        )
      ),
    // Top failures by userId
    db
      .select({
        userId: twofaEvents.endUserId,
        failures: sql<number>`count(*)::int`,
      })
      .from(twofaEvents)
      .where(
        and(
          eq(twofaEvents.workspaceId, ctx.workspaceId),
          eq(twofaEvents.eventType, "verify_failed"),
          gte(twofaEvents.createdAt, startOfMonth)
        )
      )
      .groupBy(twofaEvents.endUserId)
      .orderBy(sql`count(*) desc`)
      .limit(5),
  ]);

  const totalAttempts =
    (successCount[0]?.count ?? 0) + (failCount[0]?.count ?? 0);
  const successRate =
    totalAttempts > 0
      ? Math.round(((successCount[0]?.count ?? 0) / totalAttempts) * 10000) /
        100
      : 100;

  return NextResponse.json({
    status: "success",
    data: {
      verificationsToday: verificationsToday[0]?.count ?? 0,
      verificationsThisMonth: verificationsThisMonth[0]?.count ?? 0,
      successRate,
      enrolledUsers: enrolledUsers[0]?.count ?? 0,
      topFailures: topFailures.map((f: { userId: string | null; failures: number }) => ({
        userId: f.userId,
        failures: f.failures,
      })),
    },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
