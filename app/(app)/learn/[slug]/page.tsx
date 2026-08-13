import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  startLearningPath,
  completeLearningModule,
  pauseLearningPath,
  resumeLearningPath,
} from "@/app/(app)/learn/actions";

type LearningPathPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type LearningModule = {
  title?: string;
  summary?: string;
};

export default async function LearningPathPage({
  params,
}: LearningPathPageProps) {
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

  const { data: path, error } = await supabase
    .from("learning_paths")
    .select(`
      id,
      title,
      slug,
      description,
      audience,
      experience_level,
      estimated_time,
      outcome,
      modules,
      is_pro,
      is_featured,
      status,

      learning_path_tools (
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
      ),

      learning_path_stacks (
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

      learning_path_opportunities (
        position,
        reason,
        opportunities (
          id,
          title,
          slug,
          summary,
          category,
          difficulty,
          startup_cost,
          time_to_launch,
          opportunity_score,
          is_pro
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !path) {
    notFound();
  }

  const locked = path.is_pro && !isPro;

  const modules: LearningModule[] = Array.isArray(path.modules)
    ? path.modules.filter(
        (module): module is LearningModule =>
          typeof module === "object" &&
          module !== null &&
          !Array.isArray(module)
      )
    : [];

  const { data: progress } = await supabase
    .from("member_learning_progress")
    .select(`
      status,
      current_module,
      started_at,
      completed_at,
      last_opened_at
    `)
    .eq("user_id", user.id)
    .eq("learning_path_id", path.id)
    .maybeSingle();

  const currentModule = progress?.current_module ?? 0;

  const completedModules =
    progress?.status === "completed"
      ? modules.length
      : Math.min(currentModule, modules.length);

  const progressPercent =
    modules.length > 0
      ? Math.round(
          (completedModules / modules.length) * 100
        )
      : 0;

  const recommendedTools =
    path.learning_path_tools
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

  const recommendedStacks =
    path.learning_path_stacks
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

  const recommendedOpportunities =
    path.learning_path_opportunities
      ?.sort((a, b) => a.position - b.position)
      .flatMap((item) => {
        const opportunities = Array.isArray(item.opportunities)
          ? item.opportunities
          : item.opportunities
            ? [item.opportunities]
            : [];

        return opportunities.map((opportunity) => ({
          position: item.position,
          reason: item.reason,
          opportunity,
        }));
      }) ?? [];

  return (
    <section>
      <Link
        href="/learn"
        style={{
          display: "inline-flex",
          marginBottom: 24,
          color: "#93c5fd",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        ← Back to Learning Paths
      </Link>

      <div
        className="card"
        style={{
          padding: "clamp(28px, 5vw, 48px)",
          marginBottom: 24,
          border: path.is_featured
            ? "1px solid rgba(96,165,250,0.38)"
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
          <span style={metricPillStyle}>
            {path.experience_level}
          </span>

          <span style={metricPillStyle}>
            {path.estimated_time ?? "Flexible"}
          </span>

          <span style={metricPillStyle}>
            {modules.length} modules
          </span>

          {path.is_featured ? (
            <span style={featuredBadgeStyle}>
              ★ FEATURED
            </span>
          ) : null}

          {path.is_pro ? (
            <span style={proBadgeStyle}>PRO</span>
          ) : (
            <span style={freeBadgeStyle}>FREE</span>
          )}
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(40px, 7vw, 66px)",
            letterSpacing: "-.05em",
            lineHeight: 1.05,
          }}
        >
          {path.title}
        </h1>

        <p
          style={{
            margin: "18px 0 0",
            maxWidth: 880,
            color: "var(--muted)",
            fontSize: 18,
            lineHeight: 1.75,
          }}
        >
          {path.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginTop: 28,
          }}
        >
          <InfoBox
            label="Designed For"
            value={path.audience ?? "AITFM members"}
          />

          <InfoBox
            label="Expected Outcome"
            value={path.outcome}
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
            Pro Learning Path
          </p>

          <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>
            Unlock the complete learning path.
          </h2>

          <p
            style={{
              margin: "12px 0 20px",
              maxWidth: 760,
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            Pro members get the complete learning sequence,
            connected tools, recommended AI Stacks,
            implementation opportunities, and future exercises.
          </p>

          <Link href="/upgrade" className="btn btn-primary">
            Unlock with Pro
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          <div
            className="card"
            style={{
              padding: 30,
              border: "1px solid rgba(96,165,250,0.22)",
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
              Learning Progress
            </p>

            <h2 style={{ margin: "8px 0 8px", fontSize: 30 }}>
              {progress?.status === "completed"
                ? "Learning path completed."
                : progress?.status === "in_progress"
                  ? "Learning in progress."
                  : progress?.status === "paused"
                    ? "Learning path paused."
                    : "Ready to start learning?"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              {progress?.status === "completed"
                ? `You completed all ${modules.length} modules.`
                : progress?.status === "in_progress"
                  ? `You are currently on Module ${Math.min(
                      currentModule + 1,
                      modules.length
                    )} of ${modules.length}.`
                  : progress?.status === "paused"
                    ? `Your progress is saved at Module ${Math.min(
                        currentModule + 1,
                        modules.length
                      )} of ${modules.length}.`
                    : "Start this learning path and AITFM will save your progress as you complete each module."}
            </p>

            {progress ? (
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
                <form action={startLearningPath}>
                  <HiddenFields
                    pathId={path.id}
                    pathSlug={path.slug}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Start Learning Path
                  </button>
                </form>
              ) : null}

              {progress?.status === "in_progress" ? (
                <form action={pauseLearningPath}>
                  <HiddenFields
                    pathId={path.id}
                    pathSlug={path.slug}
                  />

                  <button
                    type="submit"
                    style={pauseButtonStyle}
                  >
                    Pause Learning
                  </button>
                </form>
              ) : null}

              {progress?.status === "paused" ? (
                <form action={resumeLearningPath}>
                  <HiddenFields
                    pathId={path.id}
                    pathSlug={path.slug}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Resume Learning
                  </button>
                </form>
              ) : null}

              {progress?.status === "completed" ? (
                <span style={completedBadgeStyle}>
                  Path Completed ✓
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
              Modules
            </p>

            <h2 style={{ margin: "8px 0 22px", fontSize: 30 }}>
              Your learning roadmap.
            </h2>

            <div style={{ display: "grid", gap: 14 }}>
              {modules.map((module, index) => {
                const isCompleted =
                  index < completedModules;

                const isCurrent =
                  progress?.status === "in_progress" &&
                  index === currentModule;

                const isPausedCurrent =
                  progress?.status === "paused" &&
                  index === currentModule;

                return (
                  <div
                    key={`${path.id}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 1fr",
                      gap: 16,
                      padding: 18,
                      borderRadius: 16,
                      border:
                        isCurrent || isPausedCurrent
                          ? "1px solid rgba(96,165,250,0.35)"
                          : "1px solid rgba(255,255,255,0.08)",
                      background: isCompleted
                        ? "rgba(34,197,94,0.05)"
                        : isCurrent
                          ? "rgba(37,99,235,0.06)"
                          : isPausedCurrent
                            ? "rgba(251,191,36,0.05)"
                            : "rgba(255,255,255,0.035)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        background: isCompleted
                          ? "rgba(34,197,94,0.14)"
                          : "rgba(37,99,235,0.18)",
                        border: isCompleted
                          ? "1px solid rgba(34,197,94,0.26)"
                          : "1px solid rgba(96,165,250,0.28)",
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
                          color: "#60a5fa",
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        Module {index + 1}
                      </p>

                      <h3
                        style={{
                          margin: "5px 0 0",
                          fontSize: 22,
                        }}
                      >
                        {module.title ??
                          `Module ${index + 1}`}
                      </h3>

                      <p
                        style={{
                          margin: "8px 0 0",
                          color: "var(--muted)",
                          lineHeight: 1.65,
                        }}
                      >
                        {module.summary ??
                          "Learning content coming soon."}
                      </p>

                      {isCurrent ? (
                        <form
                          action={completeLearningModule}
                          style={{ marginTop: 14 }}
                        >
                          <HiddenFields
                            pathId={path.id}
                            pathSlug={path.slug}
                          />

                          <input
                            type="hidden"
                            name="totalModules"
                            value={modules.length}
                          />

                          <button
                            type="submit"
                            className="btn btn-primary"
                          >
                            Complete Module
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
                          Resume learning to continue.
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: 30,
              border: "1px solid rgba(167,139,250,0.24)",
              background: "rgba(139,92,246,0.04)",
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
              Learn → Use
            </p>

            <h2 style={{ margin: "8px 0 20px", fontSize: 30 }}>
              Practice with the right AI tools.
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
                      style={resourceCardStyle}
                    >
                      <p style={resourceEyebrowStyle}>
                        Tool {index + 1}
                      </p>

                      <h3 style={resourceTitleStyle}>
                        {tool.name}
                      </h3>

                      <p style={resourceTextStyle}>
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
                        <span style={metricPillStyle}>
                          {tool.pricing_model ??
                            "Pricing varies"}
                        </span>

                        <span style={metricPillStyle}>
                          ★ {tool.rating ?? "New"}
                        </span>
                      </div>

                      <Link
                        href={`/tools/${tool.slug}`}
                        style={resourceLinkStyle}
                      >
                        View Tool →
                      </Link>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>
                No tools have been connected to this path yet.
              </p>
            )}
          </div>

          <div
            className="card"
            style={{
              padding: 30,
              border: "1px solid rgba(96,165,250,0.22)",
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
              Learn → Build
            </p>

            <h2 style={{ margin: "8px 0 20px", fontSize: 30 }}>
              Put the tools together into a workflow.
            </h2>

            {recommendedStacks.length > 0 ? (
              <div style={{ display: "grid", gap: 14 }}>
                {recommendedStacks.map(
                  ({ stack, reason }) => (
                    <div
                      key={stack.id}
                      style={resourceCardStyle}
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
                        <div style={{ maxWidth: 720 }}>
                          <p style={resourceEyebrowStyle}>
                            Recommended AI Stack
                          </p>

                          <h3 style={resourceTitleStyle}>
                            {stack.name}
                          </h3>

                          <p style={resourceTextStyle}>
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
                No AI Stack has been connected to this path yet.
              </p>
            )}
          </div>

          <div
            className="card"
            style={{
              padding: 30,
              border: "1px solid rgba(34,197,94,0.22)",
              background: "rgba(34,197,94,0.035)",
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
              Learn → Apply
            </p>

            <h2 style={{ margin: "8px 0 20px", fontSize: 30 }}>
              Apply the skill to a real opportunity.
            </h2>

            {recommendedOpportunities.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {recommendedOpportunities.map(
                  ({ opportunity, reason }) => {
                    const opportunityLocked =
                      opportunity.is_pro && !isPro;

                    return (
                      <div
                        key={opportunity.id}
                        style={resourceCardStyle}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            marginBottom: 12,
                          }}
                        >
                          <span style={metricPillStyle}>
                            {opportunity.category}
                          </span>

                          <span style={metricPillStyle}>
                            {opportunity.difficulty}
                          </span>

                          <span style={metricPillStyle}>
                            Score{" "}
                            {opportunity.opportunity_score ??
                              "—"}
                            /10
                          </span>
                        </div>

                        <h3 style={resourceTitleStyle}>
                          {opportunity.title}
                        </h3>

                        <p style={resourceTextStyle}>
                          {reason ||
                            opportunity.summary}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            marginTop: 14,
                          }}
                        >
                          <span style={metricPillStyle}>
                            {opportunity.startup_cost ??
                              "Cost varies"}
                          </span>

                          <span style={metricPillStyle}>
                            {opportunity.time_to_launch ??
                              "Time varies"}
                          </span>
                        </div>

                        {opportunityLocked ? (
                          <Link
                            href="/upgrade"
                            className="btn btn-primary"
                            style={{
                              display: "inline-flex",
                              marginTop: 16,
                            }}
                          >
                            Unlock Opportunity
                          </Link>
                        ) : (
                          <Link
                            href={`/opportunities/${opportunity.slug}`}
                            style={resourceLinkStyle}
                          >
                            Apply What You Learned →
                          </Link>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>
                No opportunities have been connected to this
                path yet.
              </p>
            )}
          </div>

          <div
            className="card"
            style={{
              padding: 30,
              border: "1px solid rgba(34,197,94,0.18)",
              background: "rgba(34,197,94,0.025)",
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

            <h2 style={{ margin: "8px 0 8px", fontSize: 30 }}>
              Turn knowledge into useful action.
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: 820,
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              Use the connected tools to practice, open the
              recommended AI Stack to understand how the tools
              work together, and then apply the skill through a
              relevant opportunity.
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
                  Open Recommended Stack
                </Link>
              ) : null}

              <Link
                href="/opportunities"
                style={secondaryLinkStyle}
              >
                Explore All Opportunities
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HiddenFields({
  pathId,
  pathSlug,
}: {
  pathId: string;
  pathSlug: string;
}) {
  return (
    <>
      <input
        type="hidden"
        name="learningPathId"
        value={pathId}
      />

      <input
        type="hidden"
        name="learningPathSlug"
        value={pathSlug}
      />
    </>
  );
}

function InfoBox({
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
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
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
          lineHeight: 1.55,
        }}
      >
        {value}
      </p>
    </div>
  );
}

const metricPillStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 700,
};

const featuredBadgeStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(37,99,235,0.18)",
  border: "1px solid rgba(96,165,250,0.3)",
  color: "#bfdbfe",
  fontSize: 12,
  fontWeight: 800,
};

const proBadgeStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 800,
};

const freeBadgeStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.08)",
  color: "#bbf7d0",
  fontSize: 12,
  fontWeight: 800,
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

const resourceCardStyle = {
  padding: 20,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.09)",
  background: "rgba(255,255,255,0.035)",
};

const resourceEyebrowStyle = {
  margin: 0,
  color: "#60a5fa",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
};

const resourceTitleStyle = {
  margin: "7px 0 0",
  fontSize: 22,
};

const resourceTextStyle = {
  margin: "8px 0 0",
  color: "var(--muted)",
  lineHeight: 1.65,
  fontSize: 14,
};

const resourceLinkStyle = {
  display: "inline-flex",
  marginTop: 16,
  color: "#93c5fd",
  textDecoration: "none",
  fontWeight: 700,
};