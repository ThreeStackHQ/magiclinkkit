import { db } from "./db";
import { workspaces } from "@magiclinkkit/db";
import { eq, sql } from "drizzle-orm";

type Plan = "free" | "pro" | "business";

interface TierLimits {
  monthlyAuthLimit: number;
}

export function getTierLimits(plan: Plan): TierLimits {
  switch (plan) {
    case "free":
      return { monthlyAuthLimit: 200 };
    case "pro":
      return { monthlyAuthLimit: 5000 };
    case "business":
      return { monthlyAuthLimit: Infinity };
  }
}

export class QuotaExceededError extends Error {
  public statusCode = 402;
  constructor(plan: Plan, limit: number) {
    super(
      `Monthly auth limit of ${limit} reached for ${plan} plan. Please upgrade.`
    );
    this.name = "QuotaExceededError";
  }
}

export async function checkAndIncrementAuth(
  workspaceId: string
): Promise<void> {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) throw new Error("Workspace not found");

  // Reset monthly counter if needed
  const now = new Date();
  const lastReset = workspace.lastResetAt;
  if (
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear()
  ) {
    await db
      .update(workspaces)
      .set({ monthlyAuthCount: 0, lastResetAt: now })
      .where(eq(workspaces.id, workspaceId));
    workspace.monthlyAuthCount = 0;
  }

  const limits = getTierLimits(workspace.plan);
  if (
    limits.monthlyAuthLimit !== Infinity &&
    workspace.monthlyAuthCount >= limits.monthlyAuthLimit
  ) {
    throw new QuotaExceededError(workspace.plan, limits.monthlyAuthLimit);
  }

  await db
    .update(workspaces)
    .set({ monthlyAuthCount: sql`${workspaces.monthlyAuthCount} + 1` })
    .where(eq(workspaces.id, workspaceId));
}
