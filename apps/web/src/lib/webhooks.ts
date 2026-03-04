import { createHmac } from "crypto";
import { db } from "./db";
import { webhookEndpoints } from "@twofakit/db";
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

async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string,
  retries = 3
): Promise<void> {
  const body = JSON.stringify(payload);
  const signature = sign(body, secret);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-TwoFAKit-Signature": signature,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return;
    } catch {
      // Retry on failure
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
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.workspaceId, workspaceId));

  const payload: WebhookPayload = {
    event,
    workspaceId,
    data,
    timestamp: new Date().toISOString(),
  };

  for (const endpoint of endpoints) {
    if (!endpoint.isActive) continue;
    const events = endpoint.events as string[];
    if (!events.includes(event)) continue;

    setImmediate(() => {
      sendWebhook(endpoint.url, payload, endpoint.secret).catch(() => {
        // Silently fail after retries
      });
    });
  }
}
