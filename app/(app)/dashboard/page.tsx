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

  const { data: preferences } = await supabase
    .from("member_preferences")
    .select(`
      primary_goal,
      experience_level,
      business_interest,
      weekly_time,
      monthly_budget,
      onboarding_complete
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: outcomeSummary } = await supabase
    .from("member_outcome_summary")
    .select(`
      total_outcomes,
      total_money_earned,
      total_time_saved,
      total_leads_generated,
      total_tasks_automated,
      skills_gained
    `)
    .eq("user_id", user.id)
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

  const { data: learningProgressRows, error: learningProgressError } =
    await supabase
      .from("member_learning_progress")
      .select(`
        id,
        status,
        current_module,
        started_at,
        completed_at,
        last_opened_at,
        learning_paths (
          id,
          title,
          slug,
          description,
          experience_level,
          estimated_time,
          modules,
          is_pro,
          is_featured
        )
      `)
      .eq("user_id", user.id)
      .order("last_opened_at", { ascending: false });

  if (learningProgressError) {
    console.error(
      "Dashboard learning progress error:",
      learningProgressError.message
    );
  }

  const learningItems =
    learningProgressRows
      ?.flatMap((row) => {
        const paths = Array.isArray(row.learning_paths)
          ? row.learning_paths
          : row.learning_paths
            ? [row.learning_paths]
            : [];

        return paths.map((path) => {
          const modules = Array.isArray(path.modules)
            ? path.modules
            : [];

          const totalModules = modules.length;

          const completedModules =
            row.status === "completed"
              ? totalModules
              : Math.min(
                  row.current_module ?? 0,
                  totalModules
                );

          const progressPercent =
            totalModules > 0
              ? Math.round(
                  (completedModules / totalModules) * 100
                )
              : 0;

          return {
            id: row.id,
            status: row.status,
            currentModule: row.current_module ?? 0,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            lastOpenedAt: row.last_opened_at,
            path,
            totalModules,
            completedModules,
            progressPercent,
          };
        });
      }) ?? [];

  const activeLearningItems = learningItems.filter(
    (item) =>
      item.status === "in_progress" ||
      item.status === "paused"
  );

  const completedLearningItems = learningItems.filter(
    (item) => item.status === "completed"
  );

  const continueLearningItem =
    activeLearningItems[0] ?? null;

  const preferredCategory = mapGoalToCategory(
    preferences?.primary_goal
  );

  const { data: recommendationCandidates, error: recommendationError } =
    await supabase
      .from("opportunities")
      .select(`
        id,
        title,
        slug,
        summary,
        category,
        difficulty,
        startup_cost,
        time_to_launch,
        opportunity_score,
        is_pro,
        is_featured,
        target_customer
      `)
      .eq("status", "published")
      .order("opportunity_score", { ascending: false });

  if (recommendationError) {
    console.error(
      "Dashboard recommendation error:",
      recommendationError.message
    );
  }

  const recommendedOpportunity = pickRecommendedOpportunity({
    opportunities: recommendationCandidates ?? [],
    preferredCategory,
    experienceLevel:
      preferences?.experience_level ?? "Beginner",
    businessInterest:
      preferences?.business_interest ?? "Other",
    monthlyBudget:
      preferences?.monthly_budget ?? "$0-$100",
    completedIds: new Set(
      completedItems.map(
        (item) => item.opportunity.id
      )
    ),
    activeIds: new Set(
      activeItems.map(
        (item) => item.opportunity.id
      )
    ),
  });

  const totalMoneyEarned = Number(
    outcomeSummary?.total_money_earned ?? 0
  );

  const totalTimeSaved = Number(
    outcomeSummary?.total_time_saved ?? 0
  );

  const totalLeadsGenerated = Number(
    outcomeSummary?.total_leads_generated ?? 0
  );

  const totalTasksAutomated = Number(
    outcomeSummary?.total_tasks_automated ?? 0
  );

  const skillsGained = Number(
    outcomeSummary?.skills_gained ?? 0
  );

  const totalOutcomes = Number(
    outcomeSummary?.total_outcomes ?? 0
  );

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
          Learn AI, discover opportunities, build workflows,
          and track the results you create along the way.
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
          label="Active Learning"
          value={activeLearningItems.length}
        />

        <StatCard
          label="Completed Builds"
          value={completedItems.length}
        />

        <StatCard
          label="Completed Learning"
          value={completedLearningItems.length}
        />

        <StatCard
          label="Membership"
          value={isPro ? "Pro" : "Free"}
        />
      </section>

      <section
        className="card"
        style={{
          padding: "clamp(24px, 5vw, 38px)",
          marginBottom: 28,
          border: "1px solid rgba(34,197,94,0.24)",
          background: "rgba(34,197,94,0.035)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#86efac",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Your AITFM Results
            </p>

            <h2
              style={{
                margin: "8px 0 8px",
                fontSize: "clamp(28px, 5vw, 40px)",
              }}
            >
              See the value you are creating with AI.
            </h2>

            <p
              style={{
                margin: 0,
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: 760,
              }}
            >
              These totals come from the outcomes you record
              while applying AITFM opportunities and workflows.
            </p>
          </div>

          <span style={resultsBadgeStyle}>
            {totalOutcomes} recorded{" "}
            {totalOutcomes === 1 ? "outcome" : "outcomes"}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 14,
            marginTop: 24,
          }}
        >
          <ResultCard
            label="Money Earned"
            value={`$${totalMoneyEarned.toLocaleString()}`}
          />

          <ResultCard
            label="Time Saved"
            value={`${formatNumber(totalTimeSaved)} hrs`}
          />

          <ResultCard
            label="Leads Generated"
            value={formatNumber(totalLeadsGenerated)}
          />

          <ResultCard
            label="Tasks Automated"
            value={formatNumber(totalTasksAutomated)}
          />

          <ResultCard
            label="Skills Gained"
            value={formatNumber(skillsGained)}
          />
        </div>

        {totalOutcomes === 0 ? (
          <p
            style={{
              margin: "18px 0 0",
              color: "var(--muted)",
              lineHeight: 1.65,
            }}
          >
            No outcomes recorded yet. Start an opportunity,
            apply the workflow, and record a real result when
            you have one.
          </p>
        ) : null}
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

          <ProgressBar
            label={
              continueItem.status === "paused"
                ? "Paused"
                : "Progress"
            }
            percent={continueItem.progressPercent}
            footer={`${continueItem.completedSteps} of ${continueItem.totalSteps} execution steps completed`}
          />
        </section>
      ) : null}

      {continueLearningItem ? (
        <section
          className="card"
          style={{
            padding: "clamp(24px, 5vw, 38px)",
            marginBottom: 28,
            border:
              continueLearningItem.status === "paused"
                ? "1px solid rgba(251,191,36,0.28)"
                : "1px solid rgba(167,139,250,0.3)",
            background: "rgba(139,92,246,0.04)",
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
                    continueLearningItem.status === "paused"
                      ? "#fde68a"
                      : "#c4b5fd",
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Continue Learning
              </p>

              <h2
                style={{
                  margin: "8px 0 0",
                  fontSize: "clamp(28px, 5vw, 40px)",
                }}
              >
                {continueLearningItem.path.title}
              </h2>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                {continueLearningItem.path.description}
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
                  {formatStatus(
                    continueLearningItem.status
                  )}
                </span>

                <span style={statusPillStyle}>
                  {continueLearningItem.path.experience_level}
                </span>

                <span style={statusPillStyle}>
                  {continueLearningItem.path.estimated_time ??
                    "Flexible"}
                </span>
              </div>
            </div>

            <Link
              href={`/learn/${continueLearningItem.path.slug}`}
              className="btn btn-primary"
            >
              {continueLearningItem.status === "paused"
                ? "Resume Learning →"
                : "Continue Learning →"}
            </Link>
          </div>

          <ProgressBar
            label={
              continueLearningItem.status === "paused"
                ? "Paused"
                : "Learning Progress"
            }
            percent={continueLearningItem.progressPercent}
            footer={`${continueLearningItem.completedModules} of ${continueLearningItem.totalModules} modules completed`}
          />
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
              color: "#c4b5fd",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Continue Learning
          </p>

          <h2
            style={{
              margin: "8px 0 8px",
              fontSize: 30,
            }}
          >
            Start a practical AI learning path.
          </h2>

          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            Learn AI through structured modules and save your
            progress as you go.
          </p>

          <Link
            href="/learn"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              marginTop: 18,
            }}
          >
            Explore Learning Paths
          </Link>
        </section>
      )}

      {preferences?.onboarding_complete &&
      recommendedOpportunity ? (
        <section
          className="card"
          style={{
            padding: "clamp(24px, 5vw, 38px)",
            marginBottom: 28,
            border: "1px solid rgba(34,197,94,0.24)",
            background: "rgba(34,197,94,0.04)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#86efac",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Recommended for You
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 22,
              flexWrap: "wrap",
              alignItems: "flex-start",
              marginTop: 8,
            }}
          >
            <div style={{ maxWidth: 780 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(28px, 5vw, 40px)",
                }}
              >
                {recommendedOpportunity.title}
              </h2>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                }}
              >
                {recommendedOpportunity.summary}
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
                  {recommendedOpportunity.category}
                </span>

                <span style={statusPillStyle}>
                  {recommendedOpportunity.difficulty}
                </span>

                <span style={statusPillStyle}>
                  {recommendedOpportunity.startup_cost ??
                    "Cost varies"}
                </span>

                <span style={statusPillStyle}>
                  Score{" "}
                  {recommendedOpportunity.opportunity_score ??
                    "—"}
                  /10
                </span>
              </div>

              <p
                style={{
                  margin: "16px 0 0",
                  color: "#bbf7d0",
                  lineHeight: 1.6,
                  fontSize: 14,
                }}
              >
                Recommended because your primary goal is{" "}
                <strong>
                  {preferences.primary_goal}
                </strong>
                , your experience level is{" "}
                <strong>
                  {preferences.experience_level}
                </strong>
                , and your selected interest is{" "}
                <strong>
                  {preferences.business_interest}
                </strong>
                .
              </p>
            </div>

            <Link
              href={`/opportunities/${recommendedOpportunity.slug}`}
              className="btn btn-primary"
            >
              View Recommendation →
            </Link>
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
            Personalize AITFM
          </p>

          <h2
            style={{
              margin: "8px 0 8px",
              fontSize: 30,
            }}
          >
            Get recommendations built around your goals.
          </h2>

          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              lineHeight: 1.7,
              maxWidth: 760,
            }}
          >
            Tell us what you want to accomplish with AI so we
            can prioritize opportunities, tools, and workflows
            that better fit you.
          </p>

          <Link
            href="/onboarding"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              marginTop: 18,
            }}
          >
            Personalize My Experience
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
          eyebrow="AITFM Learning"
          title="Build practical AI skills"
          description="Follow personalized learning paths and apply what you learn through tools, stacks, and opportunities."
          href="/learn"
          linkText="Explore Learning Paths →"
        />

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
          eyebrow="Personalization"
          title="Update your AI goals"
          description="Change your goals, experience level, business interests, time availability, or budget."
          href="/onboarding"
          linkText="Update Preferences →"
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
              ? "You have access to Pro opportunities, premium learning paths, AI Stacks, and guided implementation resources."
              : "Upgrade to unlock premium opportunities, learning paths, AI Stacks, and future member intelligence."
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

function ProgressBar({
  label,
  percent,
  footer,
}: {
  label: string;
  percent: number;
  footer: string;
}) {
  return (
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
        <span>{label}</span>
        <span>{percent}% complete</span>
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
            width: `${percent}%`,
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
        {footer}
      </p>
    </div>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        border: "1px solid rgba(34,197,94,0.16)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "var(--muted)",
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "8px 0 0",
          color: "#bbf7d0",
          fontSize: 26,
          fontWeight: 900,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function pickRecommendedOpportunity({
  opportunities,
  preferredCategory,
  experienceLevel,
  businessInterest,
  monthlyBudget,
  completedIds,
  activeIds,
}: {
  opportunities: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
    category: string;
    difficulty: string;
    startup_cost: string | null;
    time_to_launch: string | null;
    opportunity_score: number | null;
    is_pro: boolean;
    is_featured: boolean;
    target_customer: string;
  }>;
  preferredCategory: string | null;
  experienceLevel: string;
  businessInterest: string;
  monthlyBudget: string;
  completedIds: Set<string>;
  activeIds: Set<string>;
}) {
  const ranked = opportunities
    .filter(
      (opportunity) =>
        !completedIds.has(opportunity.id) &&
        !activeIds.has(opportunity.id)
    )
    .map((opportunity) => {
      let score =
        Number(opportunity.opportunity_score ?? 0) * 10;

      if (
        preferredCategory &&
        opportunity.category === preferredCategory
      ) {
        score += 30;
      }

      if (
        opportunity.difficulty === experienceLevel
      ) {
        score += 14;
      }

      if (
        experienceLevel === "Beginner" &&
        opportunity.difficulty === "Intermediate"
      ) {
        score -= 6;
      }

      if (
        experienceLevel === "Advanced" &&
        opportunity.difficulty === "Beginner"
      ) {
        score -= 3;
      }

      if (
        businessInterest !== "Other" &&
        opportunity.target_customer
          .toLowerCase()
          .includes(
            businessInterest.toLowerCase()
          )
      ) {
        score += 18;
      }

      if (opportunity.is_featured) {
        score += 6;
      }

      if (
        monthlyBudget === "$0-$100" &&
        opportunity.startup_cost?.includes("$0-")
      ) {
        score += 8;
      }

      return {
        ...opportunity,
        recommendationScore: score,
      };
    })
    .sort(
      (a, b) =>
        b.recommendationScore -
        a.recommendationScore
    );

  return ranked[0] ?? null;
}

function mapGoalToCategory(
  goal: string | undefined
) {
  switch (goal) {
    case "Make Money":
      return "Make Money";

    case "Save Time":
      return "Save Time";

    case "Find Market Gaps":
      return "Market Gaps";

    case "Learn AI":
    default:
      return null;
  }
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="card" style={{ padding: 20 }}>
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

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
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

const resultsBadgeStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.22)",
  color: "#bbf7d0",
  fontSize: 12,
  fontWeight: 800,
};