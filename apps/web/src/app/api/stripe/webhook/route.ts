export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions } from "@twofakit/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { status: "fail", message: "Missing signature" },
      { status: 400 }
    );
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
    return NextResponse.json(
      { status: "fail", message: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      const tier = session.metadata?.tier as "pro" | "business" | undefined;

      if (!workspaceId || !tier) break;

      await db
        .update(subscriptions)
        .set({
          tier,
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        })
        .where(eq(subscriptions.workspaceId, workspaceId));

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeSubId = subscription.id;

      const [existingSub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
        .limit(1);

      if (existingSub) {
        await db
          .update(subscriptions)
          .set({
            status: subscription.status === "active" ? "active" : "inactive",
            currentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          })
          .where(eq(subscriptions.id, existingSub.id));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeSubId = subscription.id;

      await db
        .update(subscriptions)
        .set({
          tier: "free",
          status: "canceled",
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubId));

      break;
    }
  }

  return NextResponse.json({ received: true });
}
