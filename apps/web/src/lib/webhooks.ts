import { createHmac } from "crypto";
import { db } from "./db";
import { webhooks } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";

interface WebhookPayload {
  event: string;
  workspaceId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

const RETRY_DELAYS = [1000, 5000, 30000];

async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string
): Promise<void> {
  const body = JSON.stringify(payload);
  const signature = sign(body, secret);

  for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MagicLinkKit-Signature": signature,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return;
    } catch {
      // Retry on failure
    }
    if (attempt < RETRY_DELAYS.length - 1) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }
}

export async function fireWebhook(
  workspaceId: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const endpoints = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.workspaceId, workspaceId));

  const payload: WebhookPayload = {
    event,
    workspaceId,
    data,
    timestamp: new Date().toISOString(),
  };

  for (const endpoint of endpoints) {
    if (!endpoint.isActive) continue;
    if (!endpoint.events?.includes(event)) continue;

    sendWebhook(endpoint.url, payload, endpoint.secret).catch(() => {
      // Silently fail after retries
    });
  }
}
