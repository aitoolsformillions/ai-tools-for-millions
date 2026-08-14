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

  const checkoutSucceeded =
    params.success === "true";

  const checkoutCanceled =
    params.canceled === "true";

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {checkoutSucceeded ? (
        <div style={successCardStyle}>
          <p style={successEyebrowStyle}>
            Payment Successful
          </p>

          <h2 style={noticeHeadingStyle}>
            {isPro
              ? "Welcome to AITFM Pro."
              : "Your payment was successful."}
          </h2>

          <p style={noticeTextStyle}>
            {isPro
              ? "Your Pro membership is active. Premium learning paths, opportunities, AI Stacks, and the expanding Pro experience are now available."
              : "Your payment was confirmed. Your membership is being updated now. Refresh this page shortly if Pro access is not visible yet."}
          </p>

          {isPro ? (
            <div style={buttonRowStyle}>
              <Link
                href="/dashboard"
                className="btn btn-primary"
              >
                Go to Pro Dashboard
              </Link>

              <Link
                href="/opportunities"
                style={secondaryButtonStyle}
              >
                Explore Opportunities
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {checkoutCanceled ? (
        <div style={canceledCardStyle}>
          <p style={canceledEyebrowStyle}>
            Checkout Canceled
          </p>

          <p style={noticeTextStyle}>
            No changes were made to your membership.
            You can continue using AITFM Free and return
            whenever you decide Pro is right for you.
          </p>
        </div>
      ) : null}

      <div
        style={{
          textAlign: "center",
          margin: "18px auto 38px",
        }}
      >
        <p style={blueEyebrowStyle}>
          AI Tools for Millions Pro
        </p>

        <h1
          style={{
            margin: "10px auto 0",
            maxWidth: 950,
            fontSize:
              "clamp(38px, 8vw, 70px)",
            letterSpacing: "-.05em",
            lineHeight: 1.03,
            overflowWrap: "anywhere",
          }}
        >
          Stop collecting AI tools.
          Start getting results from them.
        </h1>

        <p
          style={{
            margin: "20px auto 0",
            maxWidth: 790,
            color: "var(--muted)",
            fontSize:
              "clamp(17px, 3vw, 20px)",
            lineHeight: 1.7,
          }}
        >
          AITFM Pro helps turn AI education,
          tools, workflows, and opportunities
          into a personalized system for
          learning faster, working smarter,
          finding opportunities, and taking
          action.
        </p>

        {!isPro ? (
          <div
            style={{
              marginTop: 26,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <UpgradeButton />
          </div>
        ) : (
          <div
            style={{
              marginTop: 26,
            }}
          >
            <span style={activePlanBadgeStyle}>
              ✓ Your Pro Membership Is Active
            </span>
          </div>
        )}

        <p
          style={{
            margin: "13px auto 0",
            color:
              "rgba(255,255,255,0.48)",
            fontSize: 13,
          }}
        >
          $19/month • Recurring membership
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <ValueCard
          eyebrow="LEARN"
          title="Know what AI can actually do."
          description="Follow practical learning paths that help you build useful AI skills instead of trying to piece everything together yourself."
        />

        <ValueCard
          eyebrow="BUILD"
          title="Turn individual tools into systems."
          description="Use AI Stacks to understand which tools work together and how to combine them into repeatable workflows."
        />

        <ValueCard
          eyebrow="APPLY"
          title="Turn knowledge into action."
          description="Connect what you learn to practical opportunities designed around income, efficiency, business, and underserved market needs."
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        <div
          className="card"
          style={planCardStyle}
        >
          <div>
            <p style={freePlanEyebrowStyle}>
              AITFM FREE
            </p>

            <h2 style={planPriceStyle}>
              $0
            </h2>

            <p style={planDescriptionStyle}>
              Explore the AITFM ecosystem and
              start discovering useful AI
              resources.
            </p>
          </div>

          <div style={featureListStyle}>
            <Feature>
              Explore the AI tools library
            </Feature>

            <Feature>
              Save and manage favorite tools
            </Feature>

            <Feature>
              Access available free learning
              paths
            </Feature>

            <Feature>
              Explore available free
              opportunities
            </Feature>

            <Feature>
              Use available free AI Stacks
            </Feature>

            <Feature>
              Personalized member dashboard
            </Feature>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 26,
            }}
          >
            <span style={freePlanBadgeStyle}>
              {isPro
                ? "Free plan remains available"
                : "Your current plan"}
            </span>
          </div>
        </div>

        <div
          className="card"
          style={proPlanCardStyle}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <p style={proPlanEyebrowStyle}>
              ★ AITFM PRO
            </p>

            <span style={priceBadgeStyle}>
              $19 / MONTH
            </span>
          </div>

          <h2
            style={{
              margin: "14px 0 0",
              fontSize:
                "clamp(30px, 6vw, 40px)",
              lineHeight: 1.1,
            }}
          >
            The complete member experience
          </h2>

          <p style={planDescriptionStyle}>
            Built for members who want AITFM
            helping them decide what to learn,
            what to use, what to build, and
            where to apply it.
          </p>

          <div style={featureListStyle}>
            <Feature strong>
              Everything available in Free
            </Feature>

            <Feature strong>
              Premium AI opportunities and
              implementation paths
            </Feature>

            <Feature strong>
              Complete Pro learning paths
            </Feature>

            <Feature strong>
              Premium AI Stacks and guided
              workflows
            </Feature>

            <Feature strong>
              Adaptive recommendations based
              on your activity
            </Feature>

            <Feature strong>
              Learn → Use → Build → Apply
              connections
            </Feature>

            <Feature strong>
              Progress and outcome tracking
            </Feature>

            <Feature strong>
              Expanding premium resources as
              AITFM evolves
            </Feature>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 28,
            }}
          >
            {isPro ? (
              <div>
                <span style={activePlanBadgeStyle}>
                  ✓ Pro Membership Active
                </span>

                {subscriptionStatus ===
                "canceling" ? (
                  <div style={cancelingNoticeStyle}>
                    <p
                      style={{
                        margin: 0,
                        color: "#fde68a",
                        fontWeight: 800,
                      }}
                    >
                      Cancellation scheduled
                    </p>

                    <p
                      style={{
                        margin: "7px 0 0",
                        color:
                          "var(--muted)",
                        lineHeight: 1.6,
                        fontSize: 14,
                      }}
                    >
                      Your Pro benefits remain
                      available through the end
                      of your current billing
                      period.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <UpgradeButton />
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          ...sectionCardStyle,
          marginTop: 22,
        }}
      >
        <p style={blueEyebrowStyle}>
          Why Stay Pro?
        </p>

        <h2 style={sectionHeadingStyle}>
          The value should grow as AI changes.
        </h2>

        <p style={sectionTextStyle}>
          AI moves too quickly for a static
          directory to remain valuable. AITFM
          is designed around an expanding
          member system: new learning,
          opportunities, workflows, tool
          relationships, and recommendations
          can continuously give you new things
          to explore and apply.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: 12,
            marginTop: 20,
          }}
        >
          <RetentionCard
            title="Discover"
            description="Find useful tools and opportunities without sorting through endless AI noise."
          />

          <RetentionCard
            title="Understand"
            description="Learn why something matters and how it fits into a practical goal."
          />

          <RetentionCard
            title="Implement"
            description="Move from learning into workflows and opportunities instead of stopping at information."
          />

          <RetentionCard
            title="Improve"
            description="Use progress, outcomes, and behavior to make future recommendations more relevant."
          />
        </div>
      </div>

      <div
        style={{
          ...sectionCardStyle,
          marginTop: 22,
          border:
            "1px solid rgba(34,197,94,0.18)",
          background:
            "rgba(34,197,94,0.025)",
        }}
      >
        <p style={greenEyebrowStyle}>
          Built Around Outcomes
        </p>

        <h2 style={sectionHeadingStyle}>
          Pro is not supposed to give you more
          things to browse.
        </h2>

        <p style={sectionTextStyle}>
          The goal is to shorten the distance
          between discovering AI and actually
          using it. AITFM connects learning,
          tools, workflows, opportunities,
          progress, and recorded outcomes so
          members can focus on useful action.
        </p>

        <div style={buttonRowStyle}>
          {isPro ? (
            <>
              <Link
                href="/dashboard"
                className="btn btn-primary"
              >
                Continue With AITFM Pro
              </Link>

              <Link
                href="/opportunities"
                style={secondaryButtonStyle}
              >
                Find an Opportunity
              </Link>
            </>
          ) : (
            <>
              <UpgradeButton />

              <Link
                href="/dashboard"
                style={secondaryButtonStyle}
              >
                Continue With Free
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          textAlign: "center",
          padding: "18px 10px",
        }}
      >
        <p
          style={{
            margin: 0,
            color:
              "rgba(255,255,255,0.48)",
            fontSize: 13,
            lineHeight: 1.65,
          }}
        >
          Your membership status and
          subscription controls are available
          from Settings.
        </p>

        <Link
          href="/settings"
          style={{
            display: "inline-flex",
            marginTop: 8,
            color: "#93c5fd",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Manage Membership →
        </Link>
      </div>
    </section>
  );
}

function Feature({
  children,
  strong = false,
}: {
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "22px minmax(0, 1fr)",
        gap: 9,
        alignItems: "start",
      }}
    >
      <span
        style={{
          color: strong
            ? "#86efac"
            : "#93c5fd",
          fontWeight: 900,
        }}
      >
        ✓
      </span>

      <p
        style={{
          margin: 0,
          color: strong
            ? "rgba(255,255,255,0.9)"
            : "rgba(255,255,255,0.76)",
          lineHeight: 1.55,
          fontWeight: strong
            ? 650
            : 500,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function ValueCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div style={valueCardStyle}>
      <p style={blueEyebrowStyle}>
        {eyebrow}
      </p>

      <h3
        style={{
          margin: "8px 0 0",
          fontSize: 22,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "10px 0 0",
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

function RetentionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div style={retentionCardStyle}>
      <h3
        style={{
          margin: 0,
          fontSize: 18,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "8px 0 0",
          color: "var(--muted)",
          lineHeight: 1.6,
          fontSize: 14,
        }}
      >
        {description}
      </p>
    </div>
  );
}

const blueEyebrowStyle = {
  margin: 0,
  color: "#60a5fa",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
};

const greenEyebrowStyle = {
  ...blueEyebrowStyle,
  color: "#86efac",
};

const successEyebrowStyle = {
  ...blueEyebrowStyle,
  color: "#bbf7d0",
};

const canceledEyebrowStyle = {
  ...blueEyebrowStyle,
  color: "#fde68a",
};

const noticeHeadingStyle = {
  margin: "8px 0 0",
  fontSize: "clamp(25px, 6vw, 32px)",
};

const noticeTextStyle = {
  margin: "10px 0 0",
  color: "var(--muted)",
  lineHeight: 1.7,
};

const successCardStyle = {
  marginBottom: 24,
  padding: "clamp(20px, 5vw, 26px)",
  borderRadius: 18,
  border:
    "1px solid rgba(34,197,94,0.3)",
  background:
    "rgba(34,197,94,0.08)",
};

const canceledCardStyle = {
  marginBottom: 24,
  padding: "clamp(20px, 5vw, 24px)",
  borderRadius: 18,
  border:
    "1px solid rgba(251,191,36,0.28)",
  background:
    "rgba(251,191,36,0.08)",
};

const valueCardStyle = {
  minWidth: 0,
  padding: "clamp(20px, 4vw, 24px)",
  borderRadius: 18,
  border:
    "1px solid rgba(96,165,250,0.14)",
  background:
    "rgba(37,99,235,0.035)",
};

const planCardStyle = {
  minWidth: 0,
  padding: "clamp(22px, 5vw, 32px)",
  display: "flex",
  flexDirection: "column" as const,
};

const proPlanCardStyle = {
  ...planCardStyle,
  border:
    "1px solid rgba(96,165,250,0.5)",
  background:
    "linear-gradient(180deg, rgba(37,99,235,0.16), rgba(255,255,255,0.035))",
};

const freePlanEyebrowStyle = {
  margin: 0,
  color: "var(--muted)",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
};

const proPlanEyebrowStyle = {
  margin: 0,
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.08em",
};

const planPriceStyle = {
  margin: "10px 0 0",
  fontSize: 40,
};

const planDescriptionStyle = {
  margin: "12px 0 0",
  color: "var(--muted)",
  lineHeight: 1.65,
};

const featureListStyle = {
  display: "grid",
  gap: 12,
  marginTop: 24,
};

const freePlanBadgeStyle = {
  display: "inline-flex",
  padding: "11px 15px",
  borderRadius: 12,
  border:
    "1px solid rgba(255,255,255,0.12)",
  background:
    "rgba(255,255,255,0.04)",
  color: "#dbeafe",
  fontWeight: 700,
};

const activePlanBadgeStyle = {
  display: "inline-flex",
  padding: "11px 16px",
  borderRadius: 12,
  background:
    "rgba(37,99,235,0.2)",
  border:
    "1px solid rgba(96,165,250,0.3)",
  color: "#dbeafe",
  fontWeight: 800,
};

const priceBadgeStyle = {
  padding: "7px 11px",
  borderRadius: 999,
  background:
    "rgba(96,165,250,0.15)",
  border:
    "1px solid rgba(96,165,250,0.18)",
  color: "#bfdbfe",
  fontSize: 11,
  fontWeight: 800,
};

const cancelingNoticeStyle = {
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  border:
    "1px solid rgba(251,191,36,0.18)",
  background:
    "rgba(251,191,36,0.05)",
};

const sectionCardStyle = {
  padding: "clamp(22px, 5vw, 30px)",
  borderRadius: 20,
  border:
    "1px solid rgba(255,255,255,0.08)",
  background:
    "rgba(255,255,255,0.025)",
};

const sectionHeadingStyle = {
  margin: "8px 0 10px",
  fontSize:
    "clamp(27px, 6vw, 36px)",
  lineHeight: 1.15,
  overflowWrap: "anywhere" as const,
};

const sectionTextStyle = {
  margin: 0,
  maxWidth: 900,
  color: "var(--muted)",
  fontSize: 16,
  lineHeight: 1.75,
};

const retentionCardStyle = {
  minWidth: 0,
  padding: 18,
  borderRadius: 15,
  border:
    "1px solid rgba(255,255,255,0.08)",
  background:
    "rgba(255,255,255,0.03)",
};

const buttonRowStyle = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap" as const,
  marginTop: 22,
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 16px",
  borderRadius: 12,
  border:
    "1px solid rgba(255,255,255,0.14)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};