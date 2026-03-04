export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions, workspaces } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.stripeCustomerId, customerId))
        .limit(1);

      if (!ws) break;

      const plan = subscription.metadata?.plan as
        | "pro"
        | "business"
        | undefined;

      await db
        .insert(subscriptions)
        .values({
          workspaceId: ws.id,
          stripeSubscriptionId: subscription.id,
          plan: plan ?? "pro",
          status: subscription.status === "active" ? "active" : "inactive",
        })
        .onConflictDoUpdate({
          target: subscriptions.workspaceId,
          set: {
            stripeSubscriptionId: subscription.id,
            plan: plan ?? "pro",
            status: subscription.status === "active" ? "active" : "inactive",
            updatedAt: new Date(),
          },
        });

      if (plan) {
        await db
          .update(workspaces)
          .set({ plan })
          .where(eq(workspaces.id, ws.id));
      }

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        .limit(1);

      if (sub) {
        await db
          .update(subscriptions)
          .set({ plan: "free", status: "canceled", updatedAt: new Date() })
          .where(eq(subscriptions.id, sub.id));

        await db
          .update(workspaces)
          .set({ plan: "free" })
          .where(eq(workspaces.id, sub.workspaceId));
      }

      break;
    }
  }

  return NextResponse.json({ received: true });
}
