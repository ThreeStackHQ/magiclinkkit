export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { verifyAuthJwt } from "@/lib/jwt";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyAuthJwt(token);

    return NextResponse.json({
      email: payload.email,
      workspaceId: payload.workspaceId,
      metadata: payload.metadata,
      iat: payload.iat,
      exp: payload.exp,
    });
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
