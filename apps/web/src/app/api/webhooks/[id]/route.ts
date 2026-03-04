export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { webhookEndpoints } from "@twofakit/db";
import { and, eq } from "drizzle-orm";

async function handler(
  _req: NextRequest,
  ctx: { workspaceId: string },
  id: string
): Promise<NextResponse> {
  const [deleted] = await db
    .delete(webhookEndpoints)
    .where(
      and(
        eq(webhookEndpoints.id, id),
        eq(webhookEndpoints.workspaceId, ctx.workspaceId)
      )
    )
    .returning({ id: webhookEndpoints.id });

  if (!deleted) {
    return NextResponse.json(
      { status: "fail", message: "Webhook not found" },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;
  return withApiKey(req, (r, c) => handler(r, c, id));
}
