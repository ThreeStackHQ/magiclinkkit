export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { webhooks, workspaceUsers, generateToken } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";

const CreateWebhookSchema = z.object({
  url: z.string().url().max(2048),
  events: z.array(z.string()).min(1),
});

async function getWorkspaceId(userId: string): Promise<string | null> {
  const [wsUser] = await db
    .select({ workspaceId: workspaceUsers.workspaceId })
    .from(workspaceUsers)
    .where(eq(workspaceUsers.id, userId))
    .limit(1);
  return wsUser?.workspaceId ?? null;
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = await getWorkspaceId(session.user.id);
  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const endpoints = await db
    .select({
      id: webhooks.id,
      url: webhooks.url,
      events: webhooks.events,
      isActive: webhooks.isActive,
      createdAt: webhooks.createdAt,
    })
    .from(webhooks)
    .where(eq(webhooks.workspaceId, workspaceId));

  return NextResponse.json({
    webhooks: endpoints.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getWorkspaceId(session.user.id);
    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const body: unknown = await req.json();
    const result = CreateWebhookSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { url, events } = result.data;
    const secret = generateToken();

    const [endpoint] = await db
      .insert(webhooks)
      .values({ workspaceId, url, secret, events })
      .returning();

    if (!endpoint) {
      return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: endpoint.id,
        url: endpoint.url,
        events: endpoint.events,
        secret,
        isActive: endpoint.isActive,
        createdAt: endpoint.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Webhook create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
