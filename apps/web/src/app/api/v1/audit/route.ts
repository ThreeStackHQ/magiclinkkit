export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { twofaEvents } from "@magiclinkkit/db";
import { and, eq, desc, sql } from "drizzle-orm";

const PAGE_SIZE = 50;

async function handler(
  req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const userId = searchParams.get("userId");
  const eventType = searchParams.get("eventType");

  const conditions = [eq(twofaEvents.workspaceId, ctx.workspaceId)];

  if (userId) {
    conditions.push(eq(twofaEvents.endUserId, userId));
  }
  if (eventType) {
    conditions.push(
      eq(
        twofaEvents.eventType,
        eventType as
          | "enrolled"
          | "verified"
          | "verify_failed"
          | "disabled"
          | "backup_used"
          | "backup_regenerated"
      )
    );
  }

  const offset = (page - 1) * PAGE_SIZE;

  const [events, countResult] = await Promise.all([
    db
      .select()
      .from(twofaEvents)
      .where(and(...conditions))
      .orderBy(desc(twofaEvents.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(twofaEvents)
      .where(and(...conditions)),
  ]);

  const total = countResult[0]?.count ?? 0;

  return NextResponse.json({
    status: "success",
    data: {
      events: events.map((e: { id: string; endUserId: string; eventType: string; metadata: unknown; ipAddress: string | null; createdAt: Date }) => ({
        id: e.id,
        userId: e.endUserId,
        eventType: e.eventType,
        metadata: e.metadata,
        ipAddress: e.ipAddress,
        createdAt: e.createdAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
