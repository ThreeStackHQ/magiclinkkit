export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog, workspaces, workspaceUsers } from "@magiclinkkit/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { getTierLimits } from "@/lib/tier";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [wsUser] = await db
      .select({ workspaceId: workspaceUsers.workspaceId })
      .from(workspaceUsers)
      .where(eq(workspaceUsers.id, session.user.id))
      .limit(1);

    if (!wsUser) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, wsUser.workspaceId))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const authEvents = sql`${auditLog.event} IN ('magic_link.verified', 'otp.verified', 'magic_link.sent', 'otp.sent')`;

    const [todayCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(and(eq(auditLog.workspaceId, workspace.id), gte(auditLog.createdAt, startOfDay), authEvents));

    const [weekCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(and(eq(auditLog.workspaceId, workspace.id), gte(auditLog.createdAt, startOfWeek), authEvents));

    const [monthCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(and(eq(auditLog.workspaceId, workspace.id), gte(auditLog.createdAt, startOfMonth), authEvents));

    const successEvents = sql`${auditLog.event} IN ('magic_link.verified', 'otp.verified')`;

    const [successCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(and(eq(auditLog.workspaceId, workspace.id), gte(auditLog.createdAt, startOfMonth), successEvents));

    const [totalMonth] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(and(eq(auditLog.workspaceId, workspace.id), gte(auditLog.createdAt, startOfMonth)));

    const successRate =
      (totalMonth?.count ?? 0) > 0
        ? Math.round(((successCount?.count ?? 0) / (totalMonth?.count ?? 1)) * 100)
        : 0;

    const recentEmails = await db
      .select({ email: auditLog.email })
      .from(auditLog)
      .where(eq(auditLog.workspaceId, workspace.id))
      .orderBy(sql`${auditLog.createdAt} DESC`)
      .limit(50);

    const limits = getTierLimits(workspace.plan);

    return NextResponse.json({
      auths: {
        today: todayCount?.count ?? 0,
        week: weekCount?.count ?? 0,
        month: monthCount?.count ?? 0,
      },
      successRate,
      recentEmails: [...new Set(recentEmails.map((r) => r.email).filter(Boolean))],
      plan: {
        name: workspace.plan,
        used: workspace.monthlyAuthCount,
        limit: limits.monthlyAuthLimit,
      },
    });
  } catch (error: unknown) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
