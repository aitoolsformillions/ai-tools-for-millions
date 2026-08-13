import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  saveOpportunity,
  startOpportunity,
  completeOpportunityStep,
  pauseOpportunity,
  resumeOpportunity,
} from "@/app/(app)/opportunities/actions";

type OpportunityDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OpportunityDetailPage({
  params,
}: OpportunityDetailPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("id", user.id)
    .maybeSingle();

  const isPro = profile?.membership_tier === "pro";

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select(`
      id,
      title,
      slug,
      summary,
      problem,
      target_customer,
      category,
      difficulty,
      startup_cost,
      time_to_launch,
      revenue_model,
      opportunity_score,
      market_gap,
      why_now,
      ai_advantage,
      execution_steps,
      is_pro,
      is_featured,
      status,

      opportunity_stacks (
        position,
        reason,
        ai_stacks (
          id,
          name,
          slug,
          description,
          goal,
          is_premium
        )
      ),

      opportunity_tools (
        position,
        reason,
        ai_tools (
          id,
          name,
          slug,
          tagline,
          pricing_model,
          rating
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !opportunity) {
    notFound();
  }

  const { data: progress } = await supabase
    .from("opportunity_progress")
    .select("status, current_step, started_at, completed_at")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunity.id)
    .maybeSingle();

  const locked = opportunity.is_pro && !isPro;

  const executionSteps = Array.isArray(opportunity.execution_steps)
    ? opportunity.execution_steps.filter(
        (step): step is string => typeof step === "string"
      )
    : [];

  const completedStepCount =
    progress?.status === "completed"
      ? executionSteps.length
      : progress?.current_step ?? 0;

  const progressPercent =
    executionSteps.length > 0
      ? Math.round(
          (completedStepCount / executionSteps.length) * 100
        )
      : 0;

  const recommendedStacks =
    opportunity.opportunity_stacks
      ?.sort((a, b) => a.position - b.position)
      .flatMap((item) => {
        const stacks = Array.isArray(item.ai_stacks)
          ? item.ai_stacks
          : item.ai_stacks
            ? [item.ai_stacks]
            : [];

        return stacks.map((stack) => ({
          position: item.position,
          reason: item.reason,
          stack,
        }));
      }) ?? [];

  const recommendedTools =
    opportunity.opportunity_tools
      ?.sort((a, b) => a.position - b.position)
      .flatMap((item) => {
        const tools = Array.isArray(item.ai_tools)
          ? item.ai_tools
          : item.ai_tools
            ? [item.ai_tools]
            : [];

        return tools.map((tool) => ({
          position: item.position,
          reason: item.reason,
          tool,
        }));
      }) ?? [];

  return (
    <section>
      <Link
        href="/opportunities"
        style={{
          display: "inline-flex",
          marginBottom: 24,
          color: "#93c5fd",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        ← Back to Opportunities
      </Link>

      <div
        className="card"
        style={{
          padding: "clamp(26px, 5vw, 52px)",
          marginBottom: 24,
          border: opportunity.is_featured
            ? "1px solid rgba(96,165,250,0.42)"
            : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <span style={blueBadgeStyle}>
            {opportunity.category}
          </span>

          {opportunity.is_featured ? (
            <span style={featuredBadgeStyle}>
              ★ FEATURED
            </span>
          ) : null}

          {opportunity.is_pro ? (
            <span style={neutralBadgeStyle}>PRO</span>
          ) : (
            <span style={freeBadgeStyle}>FREE</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 850 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(38px, 7vw, 66px)",
                letterSpacing: "-.05em",
                lineHeight: 1.05,
              }}
            >
              {opportunity.title}
            </h1>

            <p
              style={{
                margin: "18px 0 0",
                color: "var(--muted)",
                fontSize: 19,
                lineHeight: 1.75,
              }}
            >
              {opportunity.summary}
            </p>
          </div>

          <div
            style={{
              minWidth: 150,
              padding: 20,
              borderRadius: 18,
              border: "1px solid rgba(250,204,21,0.22)",
              background: "rgba(250,204,21,0.06)",
              textAlign: "center",
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
              Opportunity Score
            </p>

            <p
              style={{
                margin: "8px 0 0",
                color: "#facc15",
                fontSize: 36,
                fontWeight: 900,
              }}
            >
              {opportunity.opportunity_score ?? "—"}
            </p>

            <p
              style={{
                margin: 0,
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              out of 10
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 28,
          }}
        >
          <Metric
            label="Difficulty"
            value={opportunity.difficulty}
          />

          <Metric
            label="Startup Cost"
            value={opportunity.startup_cost ?? "Varies"}
          />

          <Metric
            label="Time to Launch"
            value={opportunity.time_to_launch ?? "Varies"}
          />

          <Metric
            label="Revenue Model"
            value={opportunity.revenue_model ?? "Varies"}
          />
        </div>
      </div>

      {locked ? (
        <div
          className="card"
          style={{
            padding: 30,
            border: "1px solid rgba(96,165,250,0.35)",
            background: "rgba(37,99,235,0.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#93c5fd",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Pro Opportunity
          </p>

          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
            Unlock the full opportunity analysis.
          </h2>

          <p
            style={{
              margin: "12px 0 20px",
              color: "var(--muted)",
              lineHeight: 1.7,
              maxWidth: 760,
            }}
          >
            Pro members get the market-gap analysis, AI
            advantage, execution plan, recommended AI Stack,
            and the individual tools needed to act on this
            opportunity.
          </p>

          <Link href="/upgrade" className="btn btn-primary">
            Unlock with Pro
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          <InfoSection
            eyebrow="The Problem"
            title="What is going wrong today?"
            content={opportunity.problem}
          />

          <InfoSection
            eyebrow="Target Customer"
            title="Who has this problem?"
            content={opportunity.target_customer}
          />

          <InfoSection
            eyebrow="Market Gap"
            title="Where is the opportunity?"
            content={opportunity.market_gap}
          />

          <InfoSection
            eyebrow="Why Now"
            title="Why AI makes this more practical"
            content={opportunity.why_now}
          />

          <InfoSection
            eyebrow="AI Advantage"
            title="Where AI creates leverage"
            content={opportunity.ai_advantage}
          />

          <div
            className="card"
            style={{
              padding: 30,
              border: "1px solid rgba(96,165,250,0.24)",
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
              Your Progress
            </p>

            <h2
              style={{
                margin: "8px 0 10px",
                fontSize: 30,
              }}
            >
              {progress?.status === "in_progress"
                ? "You are working on this opportunity."
                : progress?.status === "completed"
                  ? "Opportunity completed."
                  : progress?.status === "paused"
                    ? "This opportunity is paused."
                    : progress?.status === "saved"
                      ? "Saved for later."
                      : "Ready to begin?"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              {progress?.status === "in_progress"
                ? `Current progress: Step ${Math.min(
                    completedStepCount + 1,
                    executionSteps.length
                  )} of ${executionSteps.length}.`
                : progress?.status === "paused"
                  ? `Paused at Step ${Math.min(
                      completedStepCount + 1,
                      executionSteps.length
                    )} of ${executionSteps.length}. Your progress has been saved.`
                  : progress?.status === "completed"
                    ? `All ${executionSteps.length} execution steps are complete.`
                    : progress?.status === "saved"
                      ? "This opportunity is saved to your account. Start it when you are ready."
                      : "Save this opportunity for later or start working through the execution plan now."}
            </p>

            {progress?.status === "in_progress" ||
            progress?.status === "paused" ||
            progress?.status === "completed" ? (
              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      background: "#2563eb",
                    }}
                  />
                </div>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "var(--muted)",
                    fontSize: 13,
                  }}
                >
                  {progressPercent}% complete
                </p>
              </div>
            ) : null}

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              {!progress ? (
                <>
                  <form action={saveOpportunity}>
                    <input
                      type="hidden"
                      name="opportunityId"
                      value={opportunity.id}
                    />

                    <input
                      type="hidden"
                      name="opportunitySlug"
                      value={opportunity.slug}
                    />

                    <button
                      type="submit"
                      style={secondaryButtonStyle}
                    >
                      Save Opportunity
                    </button>
                  </form>

                  <form action={startOpportunity}>
                    <input
                      type="hidden"
                      name="opportunityId"
                      value={opportunity.id}
                    />

                    <input
                      type="hidden"
                      name="opportunitySlug"
                      value={opportunity.slug}
                    />

                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Start Opportunity
                    </button>
                  </form>
                </>
              ) : null}

              {progress?.status === "saved" ? (
                <>
                  <span style={savedBadgeButtonStyle}>
                    Saved ✓
                  </span>

                  <form action={startOpportunity}>
                    <input
                      type="hidden"
                      name="opportunityId"
                      value={opportunity.id}
                    />

                    <input
                      type="hidden"
                      name="opportunitySlug"
                      value={opportunity.slug}
                    />

                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Start Opportunity
                    </button>
                  </form>
                </>
              ) : null}

              {progress?.status === "in_progress" ? (
                <form action={pauseOpportunity}>
                  <input
                    type="hidden"
                    name="opportunityId"
                    value={opportunity.id}
                  />

                  <input
                    type="hidden"
                    name="opportunitySlug"
                    value={opportunity.slug}
                  />

                  <button
                    type="submit"
                    style={pauseButtonStyle}
                  >
                    Pause Opportunity
                  </button>
                </form>
              ) : null}

              {progress?.status === "paused" ? (
                <form action={resumeOpportunity}>
                  <input
                    type="hidden"
                    name="opportunityId"
                    value={opportunity.id}
                  />

                  <input
                    type="hidden"
                    name="opportunitySlug"
                    value={opportunity.slug}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Resume Opportunity
                  </button>
                </form>
              ) : null}

              {progress?.status === "completed" ? (
                <span style={completedBadgeStyle}>
                  Completed ✓
                </span>
              ) : null}
            </div>
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
              Execution Plan
            </p>

            <h2
              style={{
                margin: "8px 0 22px",
                fontSize: 30,
              }}
            >
              Turn the opportunity into action.
            </h2>

            <div style={{ display: "grid", gap: 14 }}>
              {executionSteps.map((step, index) => {
                const isCompleted =
                  index < completedStepCount;

                const isCurrent =
                  progress?.status === "in_progress" &&
                  index === completedStepCount;

                const isPausedCurrent =
                  progress?.status === "paused" &&
                  index === completedStepCount;

                return (
                  <div
                    key={`${opportunity.id}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "44px 1fr",
                      gap: 16,
                      alignItems: "flex-start",
                      padding: 18,
                      borderRadius: 16,
                      border:
                        isCurrent || isPausedCurrent
                          ? "1px solid rgba(96,165,250,0.35)"
                          : "1px solid rgba(255,255,255,0.08)",
                      background: isCompleted
                        ? "rgba(34,197,94,0.06)"
                        : isCurrent
                          ? "rgba(37,99,235,0.06)"
                          : isPausedCurrent
                            ? "rgba(251,191,36,0.05)"
                            : "rgba(255,255,255,0.035)",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        background: isCompleted
                          ? "rgba(34,197,94,0.14)"
                          : "rgba(37,99,235,0.18)",
                        border: isCompleted
                          ? "1px solid rgba(34,197,94,0.28)"
                          : "1px solid rgba(96,165,250,0.3)",
                        color: isCompleted
                          ? "#bbf7d0"
                          : "#bfdbfe",
                        fontWeight: 900,
                      }}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>

                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: isCompleted
                            ? "rgba(255,255,255,0.62)"
                            : "rgba(255,255,255,0.84)",
                          lineHeight: 1.7,
                        }}
                      >
                        {step}
                      </p>

                      {isCurrent ? (
                        <form
                          action={completeOpportunityStep}
                          style={{ marginTop: 14 }}
                        >
                          <input
                            type="hidden"
                            name="opportunityId"
                            value={opportunity.id}
                          />

                          <input
                            type="hidden"
                            name="opportunitySlug"
                            value={opportunity.slug}
                          />

                          <input
                            type="hidden"
                            name="totalSteps"
                            value={executionSteps.length}
                          />

                          <button
                            type="submit"
                            className="btn btn-primary"
                          >
                            Mark Step Complete
                          </button>
                        </form>
                      ) : null}

                      {isPausedCurrent ? (
                        <p
                          style={{
                            margin: "12px 0 0",
                            color: "#fde68a",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          Resume this opportunity to continue.
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
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
              Recommended AI Stack
            </p>

            <h2
              style={{
                margin: "8px 0 20px",
                fontSize: 30,
              }}
            >
              Use a complete workflow.
            </h2>

            {recommendedStacks.length > 0 ? (
              <div style={{ display: "grid", gap: 14 }}>
                {recommendedStacks.map(
                  ({ stack, reason }) => (
                    <div
                      key={stack.id}
                      style={{
                        padding: 20,
                        borderRadius: 16,
                        border:
                          "1px solid rgba(96,165,250,0.2)",
                        background:
                          "rgba(37,99,235,0.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "flex-start",
                          gap: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ maxWidth: 720 }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: 24,
                            }}
                          >
                            {stack.name}
                          </h3>

                          <p
                            style={{
                              margin: "8px 0 0",
                              color: "var(--muted)",
                              lineHeight: 1.65,
                            }}
                          >
                            {reason ||
                              stack.description}
                          </p>
                        </div>

                        <Link
                          href={`/stacks/${stack.slug}`}
                          className="btn btn-primary"
                        >
                          Open Workflow →
                        </Link>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>
                No recommended stack has been assigned yet.
              </p>
            )}
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
              Recommended Tools
            </p>

            <h2
              style={{
                margin: "8px 0 20px",
                fontSize: 30,
              }}
            >
              The individual tools behind the workflow.
            </h2>

            {recommendedTools.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {recommendedTools.map(
                  ({ tool, reason }, index) => (
                    <div
                      key={tool.id}
                      style={{
                        padding: 20,
                        borderRadius: 16,
                        border:
                          "1px solid rgba(255,255,255,0.09)",
                        background:
                          "rgba(255,255,255,0.035)",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: "#60a5fa",
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform:
                            "uppercase",
                        }}
                      >
                        Tool {index + 1}
                      </p>

                      <h3
                        style={{
                          margin: "8px 0 0",
                          fontSize: 22,
                        }}
                      >
                        {tool.name}
                      </h3>

                      <p
                        style={{
                          margin: "8px 0 0",
                          color: "var(--muted)",
                          lineHeight: 1.6,
                          fontSize: 14,
                        }}
                      >
                        {reason || tool.tagline}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          marginTop: 14,
                        }}
                      >
                        <span
                          style={smallMetricStyle}
                        >
                          {tool.pricing_model ??
                            "Pricing varies"}
                        </span>

                        <span
                          style={smallMetricStyle}
                        >
                          ★ {tool.rating ?? "New"}
                        </span>
                      </div>

                      <Link
                        href={`/tools/${tool.slug}`}
                        style={{
                          display: "inline-flex",
                          marginTop: 16,
                          color: "#93c5fd",
                          textDecoration: "none",
                          fontWeight: 700,
                        }}
                      >
                        View Tool →
                      </Link>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>
                No recommended tools have been assigned yet.
              </p>
            )}
          </div>

          <div
            className="card"
            style={{
              padding: 30,
              border: "1px solid rgba(34,197,94,0.2)",
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
              }}
            >
              Your Next Move
            </p>

            <h2
              style={{
                margin: "8px 0 10px",
                fontSize: 30,
              }}
            >
              Move from research to execution.
            </h2>

            <p
              style={{
                margin: 0,
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: 800,
              }}
            >
              Review the execution plan, open the
              recommended AI Stack, and evaluate the
              individual tools before investing time or
              money into implementation.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              {recommendedStacks[0] ? (
                <Link
                  href={`/stacks/${recommendedStacks[0].stack.slug}`}
                  className="btn btn-primary"
                >
                  Start Recommended Workflow
                </Link>
              ) : null}

              <Link
                href="/opportunities"
                style={secondaryLinkStyle}
              >
                Explore More Opportunities
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.035)",
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
          margin: "6px 0 0",
          color: "#ffffff",
          lineHeight: 1.5,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function InfoSection({
  eyebrow,
  title,
  content,
}: {
  eyebrow: string;
  title: string;
  content: string;
}) {
  return (
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
        {eyebrow}
      </p>

      <h2
        style={{
          margin: "8px 0 10px",
          fontSize: 28,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          color: "var(--muted)",
          fontSize: 17,
          lineHeight: 1.75,
        }}
      >
        {content}
      </p>
    </div>
  );
}

const blueBadgeStyle = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "rgba(96,165,250,0.12)",
  border: "1px solid rgba(96,165,250,0.24)",
  color: "#bfdbfe",
  fontSize: 12,
  fontWeight: 800,
};

const featuredBadgeStyle = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "rgba(37,99,235,0.18)",
  border: "1px solid rgba(96,165,250,0.34)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 800,
};

const neutralBadgeStyle = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 800,
};

const freeBadgeStyle = {
  padding: "7px 11px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.08)",
  color: "#bbf7d0",
  fontSize: 12,
  fontWeight: 800,
};

const smallMetricStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 700,
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.05)",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const savedBadgeButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(34,197,94,0.22)",
  background: "rgba(34,197,94,0.08)",
  color: "#bbf7d0",
  fontWeight: 700,
};

const pauseButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(251,191,36,0.28)",
  background: "rgba(251,191,36,0.08)",
  color: "#fde68a",
  fontWeight: 700,
  cursor: "pointer",
};

const completedBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(34,197,94,0.28)",
  background: "rgba(34,197,94,0.1)",
  color: "#bbf7d0",
  fontWeight: 800,
};

const secondaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};