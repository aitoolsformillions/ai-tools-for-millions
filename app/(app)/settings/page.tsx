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
    console.error(
      "Settings profile error:",
      error.message
    );
  }

  const isPro =
    profile?.membership_tier === "pro";

  const hasStripeCustomer = Boolean(
    profile?.stripe_customer_id
  );

  const subscriptionStatus =
    profile?.subscription_status ?? "inactive";

  const isCanceling =
    subscriptionStatus === "canceling";

  const isActive =
    subscriptionStatus === "active";

  const isPastDue =
    subscriptionStatus === "past_due";

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          marginBottom: 30,
        }}
      >
        <p style={eyebrowStyle}>
          Settings
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize:
              "clamp(36px, 8vw, 56px)",
            letterSpacing: "-.045em",
            lineHeight: 1.05,
          }}
        >
          Account & Membership
        </h1>

        <p
          style={{
            margin: "14px 0 0",
            maxWidth: 760,
            color: "var(--muted)",
            fontSize:
              "clamp(16px, 3vw, 18px)",
            lineHeight: 1.7,
          }}
        >
          Manage your password, membership
          status, billing access, and plan
          controls from one place.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 20,
        }}
      >
        <div
          className="card"
          style={membershipCardStyle}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: 16,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={eyebrowStyle}>
                Membership
              </p>

              <h2
                style={{
                  margin: "8px 0 0",
                  fontSize:
                    "clamp(28px, 6vw, 36px)",
                  lineHeight: 1.1,
                }}
              >
                {isPro
                  ? "AITFM Pro"
                  : "AITFM Free"}
              </h2>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                Current subscription status:{" "}
                <strong
                  style={{
                    color: "#ffffff",
                  }}
                >
                  {formatSubscriptionStatus(
                    subscriptionStatus
                  )}
                </strong>
              </p>
            </div>

            <span
              style={
                isPro
                  ? proPlanBadgeStyle
                  : freePlanBadgeStyle
              }
            >
              {isPro ? "PRO" : "FREE"}
            </span>
          </div>

          {isPro && isActive ? (
            <StatusNotice
              tone="success"
              title="Your Pro membership is active."
              description="Premium learning paths, Pro opportunities, AI Stacks, adaptive recommendations, and other Pro features are currently available on your account."
            />
          ) : null}

          {isPro && isCanceling ? (
            <StatusNotice
              tone="warning"
              title="Your Pro membership is scheduled to cancel."
              description="You still have full Pro access through the end of your current billing period. After that date, your account will automatically return to the Free plan."
            />
          ) : null}

          {isPastDue ? (
            <StatusNotice
              tone="danger"
              title="Your subscription payment needs attention."
              description="Your billing provider is reporting a past-due subscription. Use Manage Subscription to review your payment method or billing status."
            />
          ) : null}

          {!isPro ? (
            <div style={freeValueBoxStyle}>
              <p
                style={{
                  margin: 0,
                  color: "#bfdbfe",
                  fontWeight: 800,
                }}
              >
                You are currently using AITFM Free.
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                Upgrade when you want access to
                the complete member experience,
                including premium opportunities,
                learning paths, AI Stacks, and
                deeper adaptive intelligence.
              </p>
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 22,
            }}
          >
            {isPro && hasStripeCustomer ? (
              <ManageSubscriptionButton />
            ) : (
              <Link
                href="/upgrade"
                className="btn btn-primary"
              >
                View Pro Membership
              </Link>
            )}

            {isPro ? (
              <Link
                href="/upgrade"
                style={secondaryButtonStyle}
              >
                View Pro Benefits
              </Link>
            ) : null}
          </div>

          {isPro && hasStripeCustomer ? (
            <p
              style={{
                margin: "14px 0 0",
                color:
                  "rgba(255,255,255,0.48)",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              Manage Subscription opens the
              billing portal where you can review
              billing details and available
              subscription controls.
            </p>
          ) : null}
        </div>

        <div
          className="card"
          style={standardCardStyle}
        >
          <p style={eyebrowStyle}>
            Security
          </p>

          <h2 style={sectionHeadingStyle}>
            Password & sign-in
          </h2>

          <p style={sectionTextStyle}>
            Change the password used to sign in
            to your AI Tools for Millions account.
          </p>

          <Link
            href="/forgot-password"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              marginTop: 18,
            }}
          >
            Change Password
          </Link>
        </div>

        <div
          className="card"
          style={standardCardStyle}
        >
          <p style={eyebrowStyle}>
            Personalization
          </p>

          <h2 style={sectionHeadingStyle}>
            Update what AITFM recommends
          </h2>

          <p style={sectionTextStyle}>
            Your goals, experience level,
            interests, available time, and budget
            help shape personalized learning and
            opportunity recommendations.
          </p>

          <Link
            href="/onboarding"
            style={secondaryButtonStyle}
          >
            Update Preferences
          </Link>
        </div>

        <div
          className="card"
          style={standardCardStyle}
        >
          <p style={eyebrowStyle}>
            Account
          </p>

          <h2 style={sectionHeadingStyle}>
            Review your member profile
          </h2>

          <p style={sectionTextStyle}>
            View the profile information connected
            to your AITFM account.
          </p>

          <Link
            href="/profile"
            style={secondaryButtonStyle}
          >
            View Profile
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatusNotice({
  tone,
  title,
  description,
}: {
  tone:
    | "success"
    | "warning"
    | "danger";
  title: string;
  description: string;
}) {
  const styles =
    tone === "success"
      ? {
          border:
            "1px solid rgba(34,197,94,0.24)",
          background:
            "rgba(34,197,94,0.07)",
          title: "#bbf7d0",
        }
      : tone === "warning"
        ? {
            border:
              "1px solid rgba(251,191,36,0.28)",
            background:
              "rgba(251,191,36,0.07)",
            title: "#fde68a",
          }
        : {
            border:
              "1px solid rgba(248,113,113,0.24)",
            background:
              "rgba(127,29,29,0.1)",
            title: "#fecaca",
          };

  return (
    <div
      style={{
        marginTop: 20,
        padding: 18,
        borderRadius: 14,
        border: styles.border,
        background: styles.background,
      }}
    >
      <p
        style={{
          margin: 0,
          color: styles.title,
          fontWeight: 800,
        }}
      >
        {title}
      </p>

      <p
        style={{
          margin: "8px 0 0",
          color: "var(--muted)",
          lineHeight: 1.65,
          fontSize: 14,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function formatSubscriptionStatus(
  status: string
) {
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

const eyebrowStyle = {
  margin: 0,
  color: "#60a5fa",
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

const membershipCardStyle = {
  padding: "clamp(22px, 5vw, 32px)",
  border:
    "1px solid rgba(96,165,250,0.2)",
  background:
    "linear-gradient(180deg, rgba(37,99,235,0.06), rgba(255,255,255,0.025))",
};

const standardCardStyle = {
  padding: "clamp(22px, 5vw, 30px)",
};

const sectionHeadingStyle = {
  margin: "8px 0 0",
  fontSize:
    "clamp(25px, 6vw, 31px)",
  lineHeight: 1.15,
};

const sectionTextStyle = {
  margin: "10px 0 0",
  maxWidth: 720,
  color: "var(--muted)",
  lineHeight: 1.7,
};

const proPlanBadgeStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  border:
    "1px solid rgba(96,165,250,0.26)",
  background:
    "rgba(37,99,235,0.14)",
  color: "#bfdbfe",
  fontSize: 11,
  fontWeight: 900,
};

const freePlanBadgeStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  border:
    "1px solid rgba(255,255,255,0.1)",
  background:
    "rgba(255,255,255,0.04)",
  color: "#dbeafe",
  fontSize: 11,
  fontWeight: 900,
};

const freeValueBoxStyle = {
  marginTop: 20,
  padding: 18,
  borderRadius: 14,
  border:
    "1px solid rgba(96,165,250,0.16)",
  background:
    "rgba(37,99,235,0.04)",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 16px",
  borderRadius: 12,
  border:
    "1px solid rgba(255,255,255,0.14)",
  background:
    "rgba(255,255,255,0.03)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};