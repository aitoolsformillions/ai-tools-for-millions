import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function UpgradePage() {
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

  return (
    <section>
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
              COMING SOON
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
            ) : (
              <button
                type="button"
                disabled
                style={{
                  padding: "12px 18px",
                  border: 0,
                  borderRadius: 12,
                  background: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 800,
                  opacity: 0.7,
                  cursor: "not-allowed",
                }}
              >
                Upgrade Coming Soon
              </button>
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
          Finding an AI tool is only the beginning. Pro will focus on helping
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

function Feature({ children }: { children: React.ReactNode }) {
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