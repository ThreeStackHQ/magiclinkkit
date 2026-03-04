export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  workspaces,
  workspaceUsers,
  generateToken,
  hashPassword,
} from "@magiclinkkit/db";

const SignupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const result = SignupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { name, email, password } = result.data;

    const apiKey = `mlk_${generateToken()}`;
    const passwordHash = await hashPassword(password);

    const [workspace] = await db
      .insert(workspaces)
      .values({ name, apiKey })
      .returning({ id: workspaces.id, apiKey: workspaces.apiKey });

    if (!workspace) {
      return NextResponse.json(
        { error: "Failed to create workspace" },
        { status: 500 }
      );
    }

    await db.insert(workspaceUsers).values({
      workspaceId: workspace.id,
      email,
      passwordHash,
    });

    return NextResponse.json(
      { workspaceId: workspace.id, apiKey: workspace.apiKey },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
