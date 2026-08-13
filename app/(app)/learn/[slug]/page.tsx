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
      status
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
            Pro members get the complete learning sequence
            plus future exercises, connected tools, workflows,
            and implementation resources.
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
              border: "1px solid rgba(34,197,94,0.18)",
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

            <h2 style={{ margin: "8px 0 8px", fontSize: 30 }}>
              Put what you learn into practice.
            </h2>

            <p
              style={{
                margin: 0,
                maxWidth: 800,
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              Continue into AITFM Opportunities and AI Stacks
              to turn learning into practical workflows and
              implementation.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <Link
                href="/opportunities"
                className="btn btn-primary"
              >
                Explore Opportunities
              </Link>

              <Link href="/stacks" style={secondaryLinkStyle}>
                Explore AI Stacks
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