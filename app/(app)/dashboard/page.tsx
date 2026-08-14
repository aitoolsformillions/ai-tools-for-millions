import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import {
  recordRecommendationEvent,
  dismissRecommendation,
} from "@/app/(app)/recommendations/actions";
import styles from "./dashboard.module.css";

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

  const {
    data: recommendationEvents,
    error: recommendationEventsError,
  } = await supabase
    .from("recommendation_events")
    .select(`
      recommendation_type,
      recommendation_id,
      event_type,
      context,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (recommendationEventsError) {
    console.error(
      "Recommendation events load error:",
      recommendationEventsError.message
    );
  }

  const displayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "there";

  const isPro = profile?.membership_tier === "pro";

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

  const {
    data: progressRows,
    error: progressError,
  } = await supabase
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
    .order("last_opened_at", {
      ascending: false,
    });

  if (progressError) {
    console.error(
      "Dashboard opportunity progress error:",
      progressError.message
    );
  }

  const progressItems =
    progressRows?.flatMap((row) => {
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
            : Math.min(
                row.current_step ?? 0,
                totalSteps
              );

        const progressPercent =
          totalSteps > 0
            ? Math.round(
                (completedSteps / totalSteps) * 100
              )
            : 0;

        return {
          id: row.id,
          status: row.status,
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

  const {
    data: learningProgressRows,
    error: learningProgressError,
  } = await supabase
    .from("member_learning_progress")
    .select(`
      id,
      status,
      current_module,
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
    .order("last_opened_at", {
      ascending: false,
    });

  if (learningProgressError) {
    console.error(
      "Dashboard learning progress error:",
      learningProgressError.message
    );
  }

  const learningItems =
    learningProgressRows?.flatMap((row) => {
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

  const opportunityEvents =
    (recommendationEvents ?? []).filter(
      (event) =>
        event.recommendation_type === "opportunity"
    );

  const learningEvents =
    (recommendationEvents ?? []).filter(
      (event) =>
        event.recommendation_type === "learning_path"
    );

  const dismissedOpportunityIds = new Set(
    opportunityEvents
      .filter(
        (event) => event.event_type === "dismissed"
      )
      .map((event) => event.recommendation_id)
  );

  const openedOpportunityCounts =
    new Map<string, number>();

  const startedOpportunityIds =
    new Set<string>();

  const completedOpportunityBehaviorIds =
    new Set<string>();

  for (const event of opportunityEvents) {
    if (event.event_type === "opened") {
      openedOpportunityCounts.set(
        event.recommendation_id,
        (openedOpportunityCounts.get(
          event.recommendation_id
        ) ?? 0) + 1
      );
    }

    if (event.event_type === "started") {
      startedOpportunityIds.add(
        event.recommendation_id
      );
    }

    if (event.event_type === "completed") {
      completedOpportunityBehaviorIds.add(
        event.recommendation_id
      );
    }
  }

  const learningStarts = learningEvents.filter(
    (event) => event.event_type === "started"
  ).length;

  const learningCompletions = learningEvents.filter(
    (event) => event.event_type === "completed"
  ).length;

  const highestCompletedLearningLevel =
    getHighestCompletedLearningLevel(
      completedLearningItems.map(
        (item) => item.path.experience_level
      )
    );

  const preferredCategory = mapGoalToCategory(
    preferences?.primary_goal
  );

  const {
    data: recommendationCandidates,
    error: recommendationError,
  } = await supabase
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
    .order("opportunity_score", {
      ascending: false,
    });

  if (recommendationError) {
    console.error(
      "Dashboard recommendation error:",
      recommendationError.message
    );
  }

  const recommendedOpportunity =
    pickRecommendedOpportunity({
      opportunities:
        recommendationCandidates ?? [],
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
      dismissedIds:
        dismissedOpportunityIds,
      openedCounts:
        openedOpportunityCounts,
      startedBehaviorIds:
        startedOpportunityIds,
      completedBehaviorIds:
        completedOpportunityBehaviorIds,
      totalMoneyEarned,
      totalTimeSaved,
      totalLeadsGenerated,
      totalTasksAutomated,
      skillsGained,
      learningStarts,
      learningCompletions,
      highestCompletedLearningLevel,
    });

  const adaptiveReason = buildAdaptiveReason({
    primaryGoal: preferences?.primary_goal,
    totalMoneyEarned,
    totalTimeSaved,
    totalLeadsGenerated,
    totalTasksAutomated,
    learningCompletions,
    highestCompletedLearningLevel,
  });

  return (
    <main className={styles.page}>
      <form
        action={signOut}
        className={styles.topActions}
      >
        <button
          type="submit"
          style={secondaryButtonStyle}
        >
          Sign Out
        </button>
      </form>

      <section className={styles.hero}>
        <p style={blueEyebrowStyle}>
          Member Dashboard
        </p>

        <h1 className={styles.heroTitle}>
          Welcome back, {displayName}.
        </h1>

        <p className={styles.heroText}>
          Learn AI, build useful systems, measure your
          results, and let AITFM improve what it
          recommends as you use the platform.
        </p>
      </section>

      <section className={styles.statGrid}>
        <StatCard
          label="Active Opportunities"
          value={activeItems.length}
        />

        <StatCard
          label="Saved for Later"
          value={savedItems.length}
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
          label="Membership"
          value={isPro ? "Pro" : "Free"}
        />
      </section>

      <section style={resultsSectionStyle}>
        <div className={styles.cardHeader}>
          <div>
            <p style={greenEyebrowStyle}>
              Your AITFM Results
            </p>

            <h2 className={styles.sectionTitle}>
              Your AI value is becoming measurable.
            </h2>

            <p style={sectionTextStyle}>
              These totals come from the real outcomes
              you record while applying AITFM workflows
              and opportunities.
            </p>
          </div>

          <span style={resultsBadgeStyle}>
            {totalOutcomes} recorded{" "}
            {totalOutcomes === 1
              ? "outcome"
              : "outcomes"}
          </span>
        </div>

        <div className={styles.resultGrid}>
          <ResultCard
            label="Money Earned"
            value={`$${formatNumber(
              totalMoneyEarned
            )}`}
          />

          <ResultCard
            label="Time Saved"
            value={`${formatNumber(
              totalTimeSaved
            )} hrs`}
          />

          <ResultCard
            label="Leads Generated"
            value={formatNumber(
              totalLeadsGenerated
            )}
          />

          <ResultCard
            label="Tasks Automated"
            value={formatNumber(
              totalTasksAutomated
            )}
          />

          <ResultCard
            label="Skills Gained"
            value={formatNumber(skillsGained)}
          />
        </div>
      </section>

      {continueItem ? (
        <section style={standardSectionStyle}>
          <div className={styles.cardHeader}>
            <div style={{ maxWidth: 760 }}>
              <p style={blueEyebrowStyle}>
                Continue Building
              </p>

              <h2 className={styles.sectionTitle}>
                {continueItem.opportunity.title}
              </h2>

              <p style={sectionTextStyle}>
                {continueItem.opportunity.summary}
              </p>
            </div>

            <Link
              href={`/opportunities/${continueItem.opportunity.slug}`}
              className={`btn btn-primary ${styles.fullMobileButton}`}
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
        <section style={learningSectionStyle}>
          <div className={styles.cardHeader}>
            <div style={{ maxWidth: 760 }}>
              <p style={purpleEyebrowStyle}>
                Continue Learning
              </p>

              <h2 className={styles.sectionTitle}>
                {continueLearningItem.path.title}
              </h2>

              <p style={sectionTextStyle}>
                {continueLearningItem.path.description}
              </p>
            </div>

            <Link
              href={`/learn/${continueLearningItem.path.slug}`}
              className={`btn btn-primary ${styles.fullMobileButton}`}
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
            percent={
              continueLearningItem.progressPercent
            }
            footer={`${continueLearningItem.completedModules} of ${continueLearningItem.totalModules} modules completed`}
          />
        </section>
      ) : null}

      {preferences?.onboarding_complete &&
      recommendedOpportunity ? (
        <section style={adaptiveSectionStyle}>
          <p style={greenEyebrowStyle}>
            Adaptive Recommendation
          </p>

          <div
            className={styles.cardHeader}
            style={{ marginTop: 8 }}
          >
            <div style={{ maxWidth: 780 }}>
              <h2 className={styles.sectionTitle}>
                {recommendedOpportunity.title}
              </h2>

              <p style={sectionTextStyle}>
                {recommendedOpportunity.summary}
              </p>

              <div style={pillRowStyle}>
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

              <div style={reasonBoxStyle}>
                <p style={reasonLabelStyle}>
                  Why AITFM chose this
                </p>

                <p style={reasonTextStyle}>
                  {adaptiveReason}
                </p>
              </div>
            </div>

            <div className={styles.actionRow}>
              <form action={recordRecommendationEvent}>
                <input
                  type="hidden"
                  name="recommendationType"
                  value="opportunity"
                />

                <input
                  type="hidden"
                  name="recommendationId"
                  value={recommendedOpportunity.id}
                />

                <input
                  type="hidden"
                  name="eventType"
                  value="opened"
                />

                <input
                  type="hidden"
                  name="context"
                  value="dashboard_adaptive_intelligence"
                />

                <input
                  type="hidden"
                  name="destination"
                  value={`/opportunities/${recommendedOpportunity.slug}`}
                />

                <button
                  type="submit"
                  className={`btn btn-primary ${styles.fullMobileButton}`}
                >
                  View Recommendation →
                </button>
              </form>

              <form action={dismissRecommendation}>
                <input
                  type="hidden"
                  name="recommendationType"
                  value="opportunity"
                />

                <input
                  type="hidden"
                  name="recommendationId"
                  value={recommendedOpportunity.id}
                />

                <input
                  type="hidden"
                  name="context"
                  value="dashboard_adaptive_intelligence"
                />

                <button
                  type="submit"
                  className={styles.fullMobileButton}
                  style={dismissButtonStyle}
                >
                  Not Interested
                </button>
              </form>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.featureGrid}>
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
              ? "You have access to Pro opportunities, premium learning paths, AI Stacks, adaptive recommendations, and guided implementation."
              : "Upgrade to unlock premium opportunities, learning paths, AI Stacks, and deeper member intelligence."
          }
          href={
            isPro ? "/settings" : "/upgrade"
          }
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

function pickRecommendedOpportunity({
  opportunities,
  preferredCategory,
  experienceLevel,
  businessInterest,
  monthlyBudget,
  completedIds,
  activeIds,
  dismissedIds,
  openedCounts,
  startedBehaviorIds,
  completedBehaviorIds,
  totalMoneyEarned,
  totalTimeSaved,
  totalLeadsGenerated,
  totalTasksAutomated,
  skillsGained,
  learningStarts,
  learningCompletions,
  highestCompletedLearningLevel,
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
  dismissedIds: Set<string>;
  openedCounts: Map<string, number>;
  startedBehaviorIds: Set<string>;
  completedBehaviorIds: Set<string>;
  totalMoneyEarned: number;
  totalTimeSaved: number;
  totalLeadsGenerated: number;
  totalTasksAutomated: number;
  skillsGained: number;
  learningStarts: number;
  learningCompletions: number;
  highestCompletedLearningLevel:
    | "Beginner"
    | "Intermediate"
    | "Advanced"
    | null;
}) {
  const ranked = opportunities
    .filter(
      (opportunity) =>
        !completedIds.has(opportunity.id) &&
        !activeIds.has(opportunity.id) &&
        !dismissedIds.has(opportunity.id) &&
        !completedBehaviorIds.has(opportunity.id)
    )
    .map((opportunity) => {
      let score =
        Number(
          opportunity.opportunity_score ?? 0
        ) * 10;

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
        score -= 4;
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

      const category =
        opportunity.category.toLowerCase();

      const titleAndSummary =
        `${opportunity.title} ${opportunity.summary}`.toLowerCase();

      if (
        totalMoneyEarned > 0 ||
        totalLeadsGenerated > 0
      ) {
        if (
          category.includes("money") ||
          titleAndSummary.includes("lead") ||
          titleAndSummary.includes("revenue") ||
          titleAndSummary.includes("customer")
        ) {
          score += 16;
        }
      }

      if (
        totalTimeSaved > 0 ||
        totalTasksAutomated > 0
      ) {
        if (
          category.includes("time") ||
          titleAndSummary.includes("automation") ||
          titleAndSummary.includes("workflow") ||
          titleAndSummary.includes("administrative") ||
          titleAndSummary.includes("follow-up")
        ) {
          score += 18;
        }
      }

      if (
        skillsGained > 0 ||
        learningCompletions > 0
      ) {
        if (
          opportunity.difficulty === "Intermediate"
        ) {
          score += 8;
        }
      }

      if (
        highestCompletedLearningLevel ===
          "Intermediate" &&
        opportunity.difficulty === "Intermediate"
      ) {
        score += 12;
      }

      if (
        highestCompletedLearningLevel ===
          "Advanced" &&
        opportunity.difficulty === "Advanced"
      ) {
        score += 16;
      }

      if (
        learningStarts >= 2 &&
        opportunity.difficulty === "Intermediate"
      ) {
        score += 5;
      }

      const previousOpens =
        openedCounts.get(opportunity.id) ?? 0;

      if (previousOpens === 1) {
        score += 2;
      }

      if (previousOpens >= 2) {
        score -= Math.min(
          previousOpens * 4,
          16
        );
      }

      if (
        startedBehaviorIds.has(opportunity.id)
      ) {
        score -= 20;
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

function buildAdaptiveReason({
  primaryGoal,
  totalMoneyEarned,
  totalTimeSaved,
  totalLeadsGenerated,
  totalTasksAutomated,
  learningCompletions,
  highestCompletedLearningLevel,
}: {
  primaryGoal: string | undefined;
  totalMoneyEarned: number;
  totalTimeSaved: number;
  totalLeadsGenerated: number;
  totalTasksAutomated: number;
  learningCompletions: number;
  highestCompletedLearningLevel:
    | "Beginner"
    | "Intermediate"
    | "Advanced"
    | null;
}) {
  const reasons: string[] = [];

  if (primaryGoal) {
    reasons.push(
      `your stated goal is ${primaryGoal}`
    );
  }

  if (
    totalTimeSaved > 0 ||
    totalTasksAutomated > 0
  ) {
    reasons.push(
      "your recorded results show value from efficiency and automation"
    );
  }

  if (
    totalMoneyEarned > 0 ||
    totalLeadsGenerated > 0
  ) {
    reasons.push(
      "your recorded results show interest in revenue and lead-generation outcomes"
    );
  }

  if (
    learningCompletions > 0 &&
    highestCompletedLearningLevel
  ) {
    reasons.push(
      `you have completed ${highestCompletedLearningLevel.toLowerCase()} learning content`
    );
  }

  if (reasons.length === 0) {
    return "AITFM is currently using your saved preferences and opportunity fit. As you learn, build, dismiss recommendations, and record outcomes, this ranking will become more personalized.";
  }

  return `AITFM prioritized this because ${reasons.join(
    ", "
  )}.`;
}

function getHighestCompletedLearningLevel(
  levels: string[]
):
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | null {
  if (levels.includes("Advanced")) {
    return "Advanced";
  }

  if (levels.includes("Intermediate")) {
    return "Intermediate";
  }

  if (levels.includes("Beginner")) {
    return "Beginner";
  }

  return null;
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
      <div style={progressLabelStyle}>
        <span>{label}</span>
        <span>{percent}% complete</span>
      </div>

      <div style={progressTrackStyle}>
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#2563eb",
          }}
        />
      </div>

      <p style={progressFooterStyle}>
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
    <div style={resultCardStyle}>
      <p style={resultLabelStyle}>
        {label}
      </p>

      <p style={resultValueStyle}>
        {value}
      </p>
    </div>
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
    <div className="card" style={{ padding: 18 }}>
      <p style={statLabelStyle}>
        {label}
      </p>

      <p style={statValueStyle}>
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
    <div className="card" style={{ padding: 24 }}>
      <p style={blueEyebrowStyle}>
        {eyebrow}
      </p>

      <h2
        style={{
          margin: "8px 0 8px",
          fontSize: 24,
        }}
      >
        {title}
      </h2>

      <p style={sectionTextStyle}>
        {description}
      </p>

      <Link
        href={href}
        style={textLinkStyle}
      >
        {linkText}
      </Link>
    </div>
  );
}

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
}

const standardSectionStyle = {
  padding: "clamp(22px, 5vw, 36px)",
  marginBottom: 24,
  borderRadius: 20,
  border: "1px solid rgba(96,165,250,0.22)",
  background: "rgba(255,255,255,0.025)",
};

const learningSectionStyle = {
  ...standardSectionStyle,
  border: "1px solid rgba(167,139,250,0.28)",
  background: "rgba(139,92,246,0.04)",
};

const resultsSectionStyle = {
  ...standardSectionStyle,
  border: "1px solid rgba(34,197,94,0.24)",
  background: "rgba(34,197,94,0.035)",
};

const adaptiveSectionStyle = {
  ...standardSectionStyle,
  border: "1px solid rgba(34,197,94,0.28)",
  background: "rgba(34,197,94,0.045)",
};

const blueEyebrowStyle = {
  margin: 0,
  color: "#60a5fa",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const greenEyebrowStyle = {
  ...blueEyebrowStyle,
  color: "#86efac",
};

const purpleEyebrowStyle = {
  ...blueEyebrowStyle,
  color: "#c4b5fd",
};

const sectionTextStyle = {
  margin: "10px 0 0",
  color: "var(--muted)",
  lineHeight: 1.7,
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 700,
};

const statusPillStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 700,
};

const pillRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  marginTop: 16,
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

const resultCardStyle = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid rgba(34,197,94,0.16)",
  background: "rgba(255,255,255,0.03)",
};

const resultLabelStyle = {
  margin: 0,
  color: "var(--muted)",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
};

const resultValueStyle = {
  margin: "8px 0 0",
  color: "#bbf7d0",
  fontSize: 26,
  fontWeight: 900,
};

const statLabelStyle = {
  margin: 0,
  color: "var(--muted)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase" as const,
};

const statValueStyle = {
  margin: "8px 0 0",
  fontSize: 27,
  fontWeight: 900,
};

const progressLabelStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 8,
  color: "var(--muted)",
  fontSize: 13,
};

const progressTrackStyle = {
  height: 10,
  borderRadius: 999,
  overflow: "hidden",
  background: "rgba(255,255,255,0.08)",
};

const progressFooterStyle = {
  margin: "10px 0 0",
  color: "var(--muted)",
  fontSize: 13,
};

const reasonBoxStyle = {
  marginTop: 18,
  padding: 16,
  borderRadius: 14,
  background: "rgba(34,197,94,0.06)",
  border: "1px solid rgba(34,197,94,0.14)",
};

const reasonLabelStyle = {
  margin: 0,
  color: "#bbf7d0",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase" as const,
};

const reasonTextStyle = {
  margin: "7px 0 0",
  color: "rgba(255,255,255,0.78)",
  lineHeight: 1.65,
  fontSize: 14,
};

const dismissButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.72)",
  fontWeight: 700,
  cursor: "pointer",
};

const textLinkStyle = {
  display: "inline-flex",
  marginTop: 18,
  color: "#93c5fd",
  textDecoration: "none",
  fontWeight: 700,
};