import { db } from "./db";
import { workspaces } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface ApiKeyResult {
  workspaceId: string;
}

export async function validateApiKey(
  key: string
): Promise<ApiKeyResult | null> {
  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.apiKey, key))
    .limit(1);

  if (!workspace) return null;
  return { workspaceId: workspace.id };
}

export async function withApiKey(
  req: NextRequest,
  handler: (
    req: NextRequest,
    context: { workspaceId: string }
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing X-Api-Key header" },
      { status: 401 }
    );
  }

  const result = await validateApiKey(apiKey);
  if (!result) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  return handler(req, { workspaceId: result.workspaceId });
}
