import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id, membership_tier")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Portal profile lookup error:", profileError);

    return NextResponse.json(
      { error: "Unable to load your billing account." },
      { status: 500 }
    );
  }

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe billing account was found." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe portal error:", error);

    return NextResponse.json(
      { error: "Unable to open subscription management." },
      { status: 500 }
    );
  }
}