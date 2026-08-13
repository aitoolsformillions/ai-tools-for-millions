import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function DashboardPage() {
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
      "display_name, membership_tier, subscription_status"
    )
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "there";

  const isPro = profile?.membership_tier === "pro";

  const { data: progressRows, error: progressError } =
    await supabase
      .from("opportunity_progress")
      .select(`
        id,
        status,
        current_step,
        started_at,
        completed_at,
        last_opened_at,
        opportunities (
          id,
          title,
          slug,
          summary,
          category,
          opportunity_score,
          execution_steps,
          is_pro
        )
      `)
      .eq("user_id", user.id)
      .order("last_opened_at", { ascending: false });

  if (progressError) {
    console.error(
      "Dashboard opportunity progress error:",
      progressError.message
    );
  }

  const progressItems =
    progressRows
      ?.flatMap((row) => {
        const opportunities = Array.isArray(row.opportunities)
          ? row.opportunities
          : row.opportunities
            ? [row.opportunities]
            : [];

        return opportunities.map((opportunity) => {
          const executionSteps = Array.isArray(
            opportunity.execution_steps
          )
            ? opportunity.execution_steps.filter(
                (step): step is string =>
                  typeof step === "string"
              )
            : [];

          const totalSteps = executionSteps.length;

          const completedSteps =
            row.status === "completed"
              ? totalSteps
              : Math.min(row.current_step ?? 0, totalSteps);

          const progressPercent =
            totalSteps > 0
              ? Math.round(
                  (completedSteps / totalSteps) * 100
                )
              : 0;

          return {
            id: row.id,
            status: row.status,
            currentStep: row.current_step ?? 0,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            lastOpenedAt: row.last_opened_at,
            opportunity,
            totalSteps,
            completedSteps,
            progressPercent,
          };
        });
      }) ?? [];

  const activeItems = progressItems.filter(
    (item) =>
      item.status === "in_progress" ||
      item.status === "paused"
  );

  const savedItems = progressItems.filter(
    (item) => item.status === "saved"
  );

  const completedItems = progressItems.filter(
    (item) => item.status === "completed"
  );

  const continueItem = activeItems[0] ?? null;

  return (
    <main
      className="container"
      style={{ padding: "56px 0 90px" }}
    >
      <form
        action={signOut}
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 24,
        }}
      >
        <button
          type="submit"
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Sign Out
        </button>
      </form>

      <section style={{ marginBottom: 34 }}>
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
          Member Dashboard
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(40px, 7vw, 66px)",
            letterSpacing: "-.05em",
            lineHeight: 1.05,
          }}
        >
          Welcome back, {displayName}.
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            color: "var(--muted)",
            fontSize: 18,
            lineHeight: 1.7,
            maxWidth: 760,
          }}
        >
          Discover opportunities, build AI-powered
          workflows, and continue where you left off.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Active Opportunities"
          value={activeItems.length}
        />

        <StatCard
          label="Saved for Later"
          value={savedItems.length}
        />

        <StatCard
          label="Completed"
          value={completedItems.length}
        />

        <StatCard
          label="Membership"
          value={isPro ? "Pro" : "Free"}
        />
      </section>

      {continueItem ? (
        <section
          className="card"
          style={{
            padding: "clamp(24px, 5vw, 38px)",
            marginBottom: 28,
            border:
              continueItem.status === "paused"
                ? "1px solid rgba(251,191,36,0.28)"
                : "1px solid rgba(96,165,250,0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 22,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <p
                style={{
                  margin: 0,
                  color:
                    continueItem.status === "paused"
                      ? "#fde68a"
                      : "#60a5fa",
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Continue Building
              </p>

              <h2
                style={{
                  margin: "8px 0 0",
                  fontSize: "clamp(28px, 5vw, 40px)",
                }}
              >
                {continueItem.opportunity.title}
              </h2>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                {continueItem.opportunity.summary}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 16,
                }}
              >
                <span style={statusPillStyle}>
                  {formatStatus(continueItem.status)}
                </span>

                <span style={statusPillStyle}>
                  {continueItem.opportunity.category}
                </span>

                <span style={statusPillStyle}>
                  Score{" "}
                  {continueItem.opportunity.opportunity_score ??
                    "—"}
                  /10
                </span>
              </div>
            </div>

            <Link
              href={`/opportunities/${continueItem.opportunity.slug}`}
              className="btn btn-primary"
            >
              {continueItem.status === "paused"
                ? "Resume Opportunity →"
                : "Continue Opportunity →"}
            </Link>
          </div>

          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 8,
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              <span>
                {continueItem.status === "paused"
                  ? "Paused"
                  : "Progress"}
              </span>

              <span>
                {continueItem.progressPercent}% complete
              </span>
            </div>

            <div
              style={{
                height: 11,
                borderRadius: 999,
                overflow: "hidden",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  width: `${continueItem.progressPercent}%`,
                  height: "100%",
                  background: "#2563eb",
                }}
              />
            </div>

            <p
              style={{
                margin: "10px 0 0",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              {continueItem.totalSteps > 0
                ? `${continueItem.completedSteps} of ${continueItem.totalSteps} execution steps completed`
                : "Execution plan available"}
            </p>
          </div>
        </section>
      ) : (
        <section
          className="card"
          style={{
            padding: 30,
            marginBottom: 28,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Continue Building
          </p>

          <h2
            style={{
              margin: "8px 0 8px",
              fontSize: 30,
            }}
          >
            Start your first AI opportunity.
          </h2>

          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            Choose an opportunity and AITFM will help you
            move from research to execution step by step.
          </p>

          <Link
            href="/opportunities"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              marginTop: 18,
            }}
          >
            Explore Opportunities
          </Link>
        </section>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <DashboardCard
          eyebrow="Opportunity Engine"
          title="Find your next AI opportunity"
          description="Explore practical ideas for making money, saving time, and finding underserved market needs."
          href="/opportunities"
          linkText="Explore Opportunities →"
        />

        <DashboardCard
          eyebrow="AI Stacks"
          title="Use complete AI workflows"
          description="See which AI tools work together and follow guided workflows built around specific goals."
          href="/stacks"
          linkText="Explore AI Stacks →"
        />

        <DashboardCard
          eyebrow="AI Tool Discovery"
          title="Build your AI toolkit"
          description="Browse, search, compare, and save AI tools that fit the work you want to accomplish."
          href="/tools"
          linkText="Explore AI Tools →"
        />

        <DashboardCard
          eyebrow="Membership"
          title={
            isPro
              ? "Your Pro access is active"
              : "Unlock the complete AITFM experience"
          }
          description={
            isPro
              ? "You have access to Pro opportunities, premium AI Stacks, and guided implementation resources."
              : "Upgrade to unlock premium opportunities, AI Stacks, workflows, and future member intelligence."
          }
          href={isPro ? "/settings" : "/upgrade"}
          linkText={
            isPro
              ? "Manage Membership →"
              : "View Pro Membership →"
          }
        />
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 20,
      }}
    >
      <p
        style={{
          margin: 0,
          color: "var(--muted)",
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "8px 0 0",
          fontSize: 30,
          fontWeight: 900,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function DashboardCard({
  eyebrow,
  title,
  description,
  href,
  linkText,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="card" style={{ padding: 26 }}>
      <p
        style={{
          margin: 0,
          color: "#60a5fa",
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </p>

      <h2
        style={{
          margin: "8px 0 8px",
          fontSize: 25,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          color: "var(--muted)",
          lineHeight: 1.65,
        }}
      >
        {description}
      </p>

      <Link
        href={href}
        style={{
          display: "inline-flex",
          marginTop: 18,
          color: "#93c5fd",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        {linkText}
      </Link>
    </div>
  );
}

function formatStatus(status: string) {
  switch (status) {
    case "in_progress":
      return "In Progress";

    case "paused":
      return "Paused";

    case "saved":
      return "Saved";

    case "completed":
      return "Completed";

    default:
      return status;
  }
}

const statusPillStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 700,
};