import { db } from "./db";
import { workspaceApiKeys } from "@twofakit/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

interface ApiKeyResult {
  workspaceId: string;
}

export async function validateApiKey(
  key: string
): Promise<ApiKeyResult | null> {
  const prefix = key.slice(0, 8) + "_";

  const keys = await db
    .select()
    .from(workspaceApiKeys)
    .where(eq(workspaceApiKeys.keyPrefix, prefix));

  for (const k of keys) {
    if (!k.isActive) continue;
    const isValid = await bcrypt.compare(key, k.keyHash);
    if (isValid) {
      return { workspaceId: k.workspaceId };
    }
  }

  return null;
}

export async function withApiKey(
  req: NextRequest,
  handler: (
    req: NextRequest,
    context: { workspaceId: string }
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { status: "fail", message: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  const apiKey = authHeader.slice(7);
  const result = await validateApiKey(apiKey);

  if (!result) {
    return NextResponse.json(
      { status: "fail", message: "Invalid API key" },
      { status: 401 }
    );
  }

  return handler(req, { workspaceId: result.workspaceId });
}
