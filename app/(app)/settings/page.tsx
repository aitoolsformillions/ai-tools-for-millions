import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ManageSubscriptionButton } from "@/components/manage-subscription-button";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "membership_tier, subscription_status, stripe_customer_id"
    )
    .eq("id", user.id)
    .maybeSingle();

  const isPro = profile?.membership_tier === "pro";
  const hasStripeCustomer = Boolean(profile?.stripe_customer_id);

  return (
    <section>
      <div style={{ marginBottom: 30 }}>
        <span
          style={{
            color: "var(--blue-2)",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          SETTINGS
        </span>

        <h1
          style={{
            fontSize: 48,
            letterSpacing: "-.04em",
            margin: "12px 0",
          }}
        >
          Account Settings
        </h1>

        <p
          style={{
            color: "var(--muted)",
            fontSize: 18,
          }}
        >
          Manage your security, membership, and billing settings.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 20,
          maxWidth: 760,
        }}
      >
        <div className="card" style={{ padding: 30 }}>
          <h2 style={{ marginTop: 0 }}>Security</h2>

          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            Change the password used to sign in to your account.
          </p>

          <Link
            href="/forgot-password"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              marginTop: 12,
            }}
          >
            Change Password
          </Link>
        </div>

        <div className="card" style={{ padding: 30 }}>
          <p
            style={{
              margin: 0,
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Membership
          </p>

          <h2
            style={{
              margin: "8px 0",
              fontSize: 28,
            }}
          >
            {isPro ? "Pro Membership" : "Free Membership"}
          </h2>

          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            Subscription status:{" "}
            <strong>
              {profile?.subscription_status ?? "inactive"}
            </strong>
          </p>

          {isPro && hasStripeCustomer ? (
            <ManageSubscriptionButton />
          ) : (
            <Link
              href="/upgrade"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                marginTop: 12,
              }}
            >
              View Pro Membership
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}