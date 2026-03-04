export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { webhooks, workspaceUsers } from "@magiclinkkit/db";
import { and, eq } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

  const { id } = await params;

  const [deleted] = await db
    .delete(webhooks)
    .where(
      and(eq(webhooks.id, id), eq(webhooks.workspaceId, wsUser.workspaceId))
    )
    .returning({ id: webhooks.id });

  if (!deleted) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
