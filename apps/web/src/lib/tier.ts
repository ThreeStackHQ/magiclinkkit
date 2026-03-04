import { db } from "./db";
import { subscriptions, twofaEvents } from "@twofakit/db";
import { eq, and, gte, sql } from "drizzle-orm";

type Tier = "free" | "pro" | "business";

const LIMITS: Record<Tier, number> = {
  free: 1000,
  pro: 50000,
  business: Infinity,
};

export async function getUserTier(workspaceId: string): Promise<Tier> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1);

  if (!sub) return "free";
  return sub.tier;
}

export async function getMonthlyVerifications(
  workspaceId: string
): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(twofaEvents)
    .where(
      and(
        eq(twofaEvents.workspaceId, workspaceId),
        eq(twofaEvents.eventType, "verified"),
        gte(twofaEvents.createdAt, startOfMonth)
      )
    );

  return result?.count ?? 0;
}

export async function checkQuota(workspaceId: string): Promise<void> {
  const tier = await getUserTier(workspaceId);
  const limit = LIMITS[tier];

  if (limit === Infinity) return;

  const count = await getMonthlyVerifications(workspaceId);
  if (count >= limit) {
    throw new QuotaExceededError(tier, limit);
  }
}

export class QuotaExceededError extends Error {
  public statusCode = 402;
  constructor(tier: Tier, limit: number) {
    super(
      `Monthly verification limit of ${limit} reached for ${tier} plan. Please upgrade.`
    );
    this.name = "QuotaExceededError";
  }
}
