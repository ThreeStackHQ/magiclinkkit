export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog, workspaceUsers } from "@magiclinkkit/db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest): Promise<NextResponse> {
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

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const eventFilter = searchParams.get("event");
    const emailFilter = searchParams.get("email");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const conditions = [eq(auditLog.workspaceId, wsUser.workspaceId)];

    if (eventFilter) {
      conditions.push(sql`${auditLog.event} = ${eventFilter}`);
    }
    if (emailFilter) {
      conditions.push(eq(auditLog.email, emailFilter));
    }
    if (fromDate) {
      conditions.push(gte(auditLog.createdAt, new Date(fromDate)));
    }
    if (toDate) {
      conditions.push(lte(auditLog.createdAt, new Date(toDate)));
    }

    const offset = (page - 1) * limit;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(and(...conditions));

    const entries = await db
      .select()
      .from(auditLog)
      .where(and(...conditions))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        event: e.event,
        email: e.email,
        ipAddress: e.ipAddress,
        metadata: e.metadata,
        createdAt: e.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: totalResult?.count ?? 0,
        pages: Math.ceil((totalResult?.count ?? 0) / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Audit log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
