export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { webhookEndpoints } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";

const CreateWebhookSchema = z.object({
  url: z.string().url().max(2048),
  events: z.array(z.string()).min(1),
  secret: z.string().min(16).max(256).optional(),
});

async function handlePost(
  req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const result = CreateWebhookSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "Invalid input", errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { url, events } = result.data;
    const secret = result.data.secret ?? randomBytes(32).toString("hex");

    const [endpoint] = await db
      .insert(webhookEndpoints)
      .values({
        workspaceId: ctx.workspaceId,
        url,
        secret,
        events,
      })
      .returning();

    if (!endpoint) {
      return NextResponse.json(
        { status: "fail", message: "Failed to create webhook" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: {
          id: endpoint.id,
          url: endpoint.url,
          events: endpoint.events,
          secret,
          isActive: endpoint.isActive,
          createdAt: endpoint.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Webhook create error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleGet(
  _req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  const endpoints = await db
    .select({
      id: webhookEndpoints.id,
      url: webhookEndpoints.url,
      events: webhookEndpoints.events,
      isActive: webhookEndpoints.isActive,
      createdAt: webhookEndpoints.createdAt,
    })
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.workspaceId, ctx.workspaceId));

  return NextResponse.json({
    status: "success",
    data: {
      endpoints: endpoints.map((e: { id: string; url: string; events: string[]; isActive: boolean; createdAt: Date }) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      })),
    },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handlePost);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handleGet);
}
