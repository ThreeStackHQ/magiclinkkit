export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { magicLinks, auditLog } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";
import { signAuthJwt } from "@/lib/jwt";
import { fireWebhook } from "@/lib/webhooks";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const [link] = await db
      .select()
      .from(magicLinks)
      .where(eq(magicLinks.token, token))
      .limit(1);

    if (!link) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (link.usedAt) {
      return NextResponse.json({ error: "Token already used" }, { status: 410 });
    }

    if (new Date() > link.expiresAt) {
      await db.insert(auditLog).values({
        workspaceId: link.workspaceId,
        event: "magic_link.expired",
        email: link.email,
      });
      return NextResponse.json({ error: "Token expired" }, { status: 410 });
    }

    await db
      .update(magicLinks)
      .set({ usedAt: new Date() })
      .where(eq(magicLinks.id, link.id));

    const jwt = await signAuthJwt({
      workspaceId: link.workspaceId,
      email: link.email,
      metadata: link.metadata ?? undefined,
    });

    await db.insert(auditLog).values({
      workspaceId: link.workspaceId,
      event: "magic_link.verified",
      email: link.email,
    });

    fireWebhook(link.workspaceId, "magic_link.verified", {
      email: link.email,
    }).catch(() => {});

    if (link.redirectUrl) {
      const redirectUrl = new URL(link.redirectUrl);
      redirectUrl.searchParams.set("token", jwt);
      return NextResponse.redirect(redirectUrl.toString());
    }

    return NextResponse.json({
      token: jwt,
      email: link.email,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  } catch (error: unknown) {
    console.error("Magic link verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
