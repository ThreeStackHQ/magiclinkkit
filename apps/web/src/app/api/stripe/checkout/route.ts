export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { workspaces, subscriptions } from "@twofakit/db";
import { eq } from "drizzle-orm";

const CheckoutSchema = z.object({
  workspaceId: z.string().uuid(),
  tier: z.enum(["pro", "business"]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: "fail", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await req.json();
    const result = CheckoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "Invalid input" },
        { status: 422 }
      );
    }

    const { workspaceId, tier } = result.data;

    // Verify workspace ownership
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace || workspace.userId !== session.user.id) {
      return NextResponse.json(
        { status: "fail", message: "Workspace not found" },
        { status: 404 }
      );
    }

    const priceId =
      tier === "pro"
        ? process.env.STRIPE_PRICE_PRO
        : process.env.STRIPE_PRICE_BUSINESS;

    if (!priceId) {
      return NextResponse.json(
        { status: "fail", message: "Price not configured" },
        { status: 500 }
      );
    }

    // Check for existing Stripe customer
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.workspaceId, workspaceId))
      .limit(1);

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancel`,
      metadata: { workspaceId, tier },
      ...(sub?.stripeCustomerId
        ? { customer: sub.stripeCustomerId }
        : { customer_email: session.user.email ?? undefined }),
    });

    return NextResponse.json({
      status: "success",
      data: { url: checkoutSession.url },
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}
