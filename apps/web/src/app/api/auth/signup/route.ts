export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { users, workspaces, workspaceApiKeys, subscriptions } from "@magiclinkkit/db";

const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  workspaceName: z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const result = SignupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Validation error",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { email, password, name, workspaceName } = result.data;

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await db
      .insert(users)
      .values({ email, name, passwordHash })
      .returning({ id: users.id });

    if (!user) {
      return NextResponse.json(
        { status: "fail", message: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create workspace
    const [workspace] = await db
      .insert(workspaces)
      .values({
        userId: user.id,
        name: workspaceName ?? `${name}'s Workspace`,
      })
      .returning({ id: workspaces.id });

    if (!workspace) {
      return NextResponse.json(
        { status: "fail", message: "Failed to create workspace" },
        { status: 500 }
      );
    }

    // Create free subscription
    await db.insert(subscriptions).values({
      workspaceId: workspace.id,
      tier: "free",
      status: "active",
    });

    // Generate API key
    const rawKey = `tk_live_${randomBytes(32).toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 8) + "_";
    const keyHash = await bcrypt.hash(rawKey, 10);

    await db.insert(workspaceApiKeys).values({
      workspaceId: workspace.id,
      keyPrefix,
      keyHash,
      name: "Default API Key",
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          apiKey: rawKey,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return NextResponse.json(
        { status: "fail", message: "Email already registered" },
        { status: 409 }
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
