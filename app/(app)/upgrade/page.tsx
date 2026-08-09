import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButton } from "@/components/upgrade-button";

type UpgradePageProps = {
  searchParams: Promise<{
    success?: string;
    canceled?: string;
  }>;
};

export default async function UpgradePage({
  searchParams,
}: UpgradePageProps) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const isPro = profile?.membership_tier === "pro";
  const subscriptionStatus =
    profile?.subscription_status ?? "inactive";

  const checkoutSucceeded = params.success === "true";
  const checkoutCanceled = params.canceled === "true";

  return (
    <section>
      {checkoutSucceeded ? (
        <div
          style={{
            marginBottom: 24,
            padding: 22,
            borderRadius: 18,
            border: "1px solid rgba(34,197,94,0.3)",
            background: "rgba(34,197,94,0.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#bbf7d0",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Payment Successful
          </p>

          <h2
            style={{
              margin: "8px 0 0",
              fontSize: 30,
            }}
          >
            {isPro
              ? "Welcome to AI Tools for Millions Pro."
              : "Your payment was successful."}
          </h2>

          <p
            style={{
              margin: "10px 0 0",
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            {isPro
              ? "Your Pro membership is active and premium AI Stacks are now unlocked."
              : "Stripe has confirmed your payment. Your membership is being updated now. Refresh this page in a moment if Pro access is not visible yet."}
          </p>

          {isPro ? (
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <Link href="/stacks" className="btn btn-primary">
                Explore Pro AI Stacks
              </Link>

              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Go to Dashboard
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {checkoutCanceled ? (
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            borderRadius: 18,
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
            Checkout canceled.
          </p>

          <p
            style={{
              margin: "8px 0 0",
              color: "var(--muted)",
              lineHeight: 1.65,
            }}
          >
            No changes were made to your membership. You can return to
            Checkout whenever you are ready.
          </p>
        </div>
      ) : null}

      <div style={{ marginBottom: 34 }}>
        <p
          style={{
            margin: 0,
            color: "#60a5fa",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          AI Tools for Millions Pro
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(38px, 7vw, 64px)",
            letterSpacing: "-.045em",
            lineHeight: 1.05,
          }}
        >
          Turn AI discovery into an advantage.
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            maxWidth: 760,
            color: "var(--muted)",
            fontSize: 18,
            lineHeight: 1.7,
          }}
        >
          Pro is designed for members who want more than a directory.
          Get guided workflows, premium resources, and smarter ways to use
          AI for business, productivity, and income opportunities.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 22,
          alignItems: "stretch",
        }}
      >
        <div className="card" style={{ padding: 30 }}>
          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            FREE
          </p>

          <h2 style={{ margin: "10px 0", fontSize: 34 }}>$0</h2>

          <p
            style={{
              margin: "0 0 24px",
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            Everything you need to explore and organize AI tools.
          </p>

          <Feature>Browse the AI tools marketplace</Feature>
          <Feature>Live search and category filters</Feature>
          <Feature>Featured and trending discovery</Feature>
          <Feature>Save and manage favorites</Feature>
          <Feature>Tool detail pages</Feature>
          <Feature>Member dashboard</Feature>

          <div style={{ marginTop: 28 }}>
            <span
              style={{
                display: "inline-flex",
                padding: "11px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                fontWeight: 700,
              }}
            >
              {isPro ? "Free plan available" : "Your current plan"}
            </span>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 30,
            border: "1px solid rgba(96,165,250,0.5)",
            background:
              "linear-gradient(180deg, rgba(37,99,235,0.16), rgba(255,255,255,0.035))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              alignItems: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#93c5fd",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              PRO
            </p>

            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(96,165,250,0.15)",
                color: "#bfdbfe",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              $19 / MONTH
            </span>
          </div>

          <h2 style={{ margin: "10px 0", fontSize: 34 }}>
            Premium Membership
          </h2>

          <p
            style={{
              margin: "0 0 24px",
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            Built for members who want actionable AI systems instead of
            endless tool browsing.
          </p>

          <Feature>Everything included in Free</Feature>
          <Feature>Curated AI stacks for specific goals</Feature>
          <Feature>Premium prompt packs</Feature>
          <Feature>Business and income workflow playbooks</Feature>
          <Feature>Personalized AI tool recommendations</Feature>
          <Feature>Advanced discovery and member resources</Feature>
          <Feature>Future premium tools and automation features</Feature>

          <div style={{ marginTop: 28 }}>
            {isPro ? (
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "12px 18px",
                    borderRadius: 12,
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 800,
                  }}
                >
                  Pro Membership Active
                </span>

                {subscriptionStatus === "canceling" ? (
                  <p
                    style={{
                      margin: "12px 0 0",
                      color: "#fde68a",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    Your subscription is scheduled to cancel, but Pro access
                    remains active until the end of the current billing period.
                  </p>
                ) : null}
              </div>
            ) : (
              <UpgradeButton />
            )}
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: 24,
          padding: 28,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Why Pro?</h2>

        <p
          style={{
            color: "var(--muted)",
            lineHeight: 1.75,
            maxWidth: 850,
          }}
        >
          Finding an AI tool is only the beginning. Pro focuses on helping
          members understand which tools work together, what workflows to use,
          and how to apply AI to practical goals.
        </p>

        <Link
          href="/tools"
          style={{
            color: "#93c5fd",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Continue exploring AI tools →
        </Link>
      </div>
    </section>
  );
}

function Feature({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "11px 0",
        color: "rgba(255,255,255,0.82)",
        lineHeight: 1.55,
      }}
    >
      ✓ {children}
    </p>
  );
}