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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "membership_tier, subscription_status, stripe_customer_id, stripe_subscription_id"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Settings profile error:", error.message);
  }

  const isPro = profile?.membership_tier === "pro";
  const hasStripeCustomer = Boolean(profile?.stripe_customer_id);
  const subscriptionStatus =
    profile?.subscription_status ?? "inactive";

  const isCanceling = subscriptionStatus === "canceling";

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
            <strong style={{ color: "#ffffff" }}>
              {formatSubscriptionStatus(subscriptionStatus)}
            </strong>
          </p>

          {isPro && isCanceling ? (
            <div
              style={{
                margin: "18px 0",
                padding: 18,
                borderRadius: 14,
                border: "1px solid rgba(251,191,36,0.28)",
                background: "rgba(251,191,36,0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#fde68a",
                  fontWeight: 800,
                }}
              >
                Your Pro membership is scheduled to cancel.
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                You still have full Pro access during the remaining billing
                period. Stripe will end the subscription at the scheduled
                cancellation date, and your account will then return to the
                Free plan automatically.
              </p>
            </div>
          ) : null}

          {isPro && subscriptionStatus === "active" ? (
            <div
              style={{
                margin: "18px 0",
                padding: 18,
                borderRadius: 14,
                border: "1px solid rgba(34,197,94,0.24)",
                background: "rgba(34,197,94,0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#bbf7d0",
                  fontWeight: 800,
                }}
              >
                Your Pro membership is active.
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                Premium AI Stacks and other Pro features are currently
                unlocked for your account.
              </p>
            </div>
          ) : null}

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

function formatSubscriptionStatus(status: string) {
  switch (status) {
    case "active":
      return "Active";

    case "canceling":
      return "Canceling";

    case "canceled":
      return "Canceled";

    case "trialing":
      return "Trial";

    case "past_due":
      return "Past Due";

    case "inactive":
    default:
      return "Inactive";
  }
}
