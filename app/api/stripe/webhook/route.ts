import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const signature =
    request.headers.get("stripe-signature");

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing Stripe signature.",
      },
      {
        status: 400,
      }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error: "Missing Stripe webhook secret.",
      },
      {
        status: 500,
      }
    );
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
  } catch (error) {
    console.error(
      "Stripe webhook signature error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid webhook signature.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data
            .object as Stripe.Checkout.Session;

        await handleCheckoutCompleted(
          session
        );

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const eventSubscription =
          event.data
            .object as Stripe.Subscription;

        const subscription =
          await stripe.subscriptions.retrieve(
            eventSubscription.id
          );

        await syncSubscription(
          subscription
        );

        break;
      }

      case "customer.subscription.deleted": {
        const subscription =
          event.data
            .object as Stripe.Subscription;

        await handleSubscriptionDeleted(
          subscription
        );

        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Stripe webhook processing error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Webhook processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const userId =
    session.metadata?.user_id ||
    session.client_reference_id;

  const customerId =
    getStripeId(session.customer);

  const subscriptionId =
    getStripeId(session.subscription);

  if (!userId) {
    console.warn(
      "Checkout completed without AITFM user ID:",
      session.id
    );

    return;
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      membership_tier: "pro",
      subscription_status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id:
        subscriptionId,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }

  if (subscriptionId) {
    const subscription =
      await stripe.subscriptions.retrieve(
        subscriptionId
      );

    await syncSubscription(
      subscription
    );
  }
}

async function syncSubscription(
  subscription: Stripe.Subscription
) {
  const userId =
    await resolveUserId(subscription);

  if (!userId) {
    console.error(
      "Could not match Stripe subscription to AITFM profile:",
      subscription.id
    );

    return;
  }

  const subscriptionStatus =
    getAITFMSubscriptionStatus(
      subscription
    );

  const membershipTier =
    hasProAccess(subscription)
      ? "pro"
      : "free";

  const customerId =
    getStripeId(
      subscription.customer
    );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      membership_tier:
        membershipTier,
      subscription_status:
        subscriptionStatus,
      stripe_customer_id:
        customerId,
      stripe_subscription_id:
        subscription.id,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }

  console.log(
    "AITFM subscription synchronized:",
    {
      userId,
      subscriptionId:
        subscription.id,
      stripeStatus:
        subscription.status,
      cancelAtPeriodEnd:
        subscription.cancel_at_period_end,
      cancelAt:
        subscription.cancel_at,
      aitfmStatus:
        subscriptionStatus,
      membershipTier,
    }
  );
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const userId =
    await resolveUserId(subscription);

  if (!userId) {
    console.error(
      "Could not match deleted Stripe subscription to AITFM profile:",
      subscription.id
    );

    return;
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      membership_tier: "free",
      subscription_status:
        "canceled",
      stripe_subscription_id:
        null,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

async function resolveUserId(
  subscription: Stripe.Subscription
) {
  const metadataUserId =
    subscription.metadata?.user_id;

  if (metadataUserId) {
    return metadataUserId;
  }

  const {
    data: subscriptionProfile,
    error: subscriptionProfileError,
  } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq(
      "stripe_subscription_id",
      subscription.id
    )
    .maybeSingle();

  if (subscriptionProfileError) {
    throw subscriptionProfileError;
  }

  if (subscriptionProfile?.id) {
    return subscriptionProfile.id;
  }

  const customerId =
    getStripeId(
      subscription.customer
    );

  if (!customerId) {
    return null;
  }

  const {
    data: customerProfile,
    error: customerProfileError,
  } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq(
      "stripe_customer_id",
      customerId
    )
    .maybeSingle();

  if (customerProfileError) {
    throw customerProfileError;
  }

  return customerProfile?.id ?? null;
}

function getAITFMSubscriptionStatus(
  subscription: Stripe.Subscription
) {
  if (
    subscription.status ===
    "canceled"
  ) {
    return "canceled";
  }

  const hasScheduledCancellation =
    subscription.cancel_at_period_end ===
      true ||
    subscription.cancel_at !== null;

  if (hasScheduledCancellation) {
    return "canceling";
  }

  switch (subscription.status) {
    case "active":
      return "active";

    case "trialing":
      return "trialing";

    case "past_due":
      return "past_due";

    case "unpaid":
      return "unpaid";

    case "incomplete":
      return "incomplete";

    case "incomplete_expired":
      return "incomplete_expired";

    case "paused":
      return "paused";

    default:
      return subscription.status;
  }
}

function hasProAccess(
  subscription: Stripe.Subscription
) {
  return (
    subscription.status ===
      "active" ||
    subscription.status ===
      "trialing" ||
    subscription.status ===
      "past_due"
  );
}

function getStripeId(
  value:
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | Stripe.Subscription
    | null
) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id;
}