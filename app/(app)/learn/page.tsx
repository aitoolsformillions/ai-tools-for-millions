import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LearnPage() {
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

  const { data: preferences } = await supabase
    .from("member_preferences")
    .select("experience_level, primary_goal")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: learningPaths, error } = await supabase
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
      is_featured
    `)
    .eq("status", "published")
    .order("is_featured", { ascending: false });

  if (error) {
    console.error("Learning path load error:", error.message);
  }

  const rankedPaths =
    learningPaths
      ?.map((path) => {
        let relevanceScore = 0;

        if (
          preferences?.experience_level &&
          path.experience_level === preferences.experience_level
        ) {
          relevanceScore += 20;
        }

        if (
          preferences?.primary_goal === "Learn AI" &&
          path.slug === "ai-foundations-beginners"
        ) {
          relevanceScore += 30;
        }

        if (
          preferences?.primary_goal === "Save Time" &&
          path.slug === "ai-business-efficiency"
        ) {
          relevanceScore += 30;
        }

        if (
          (preferences?.primary_goal === "Make Money" ||
            preferences?.primary_goal === "Find Market Gaps") &&
          path.slug === "ai-opportunity-builder"
        ) {
          relevanceScore += 30;
        }

        if (path.is_featured) {
          relevanceScore += 8;
        }

        return {
          ...path,
          relevanceScore,
        };
      })
      .sort(
        (a, b) =>
          b.relevanceScore - a.relevanceScore
      ) ?? [];

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
          AITFM Learning
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(40px, 7vw, 68px)",
            letterSpacing: "-.05em",
            lineHeight: 1.04,
          }}
        >
          Learn AI by using it.
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            maxWidth: 820,
            color: "var(--muted)",
            fontSize: 18,
            lineHeight: 1.75,
          }}
        >
          Follow practical learning paths designed to help you
          understand AI, improve your workflows, and turn stronger
          ideas into action.
        </p>
      </div>

      {preferences ? (
        <div
          className="card"
          style={{
            padding: 22,
            marginBottom: 28,
            border: "1px solid rgba(96,165,250,0.22)",
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
            Personalized Learning
          </p>

          <p
            style={{
              margin: "8px 0 0",
              color: "var(--muted)",
              lineHeight: 1.65,
            }}
          >
            Paths are prioritized using your{" "}
            <strong style={{ color: "#ffffff" }}>
              {preferences.experience_level}
            </strong>{" "}
            experience level and your goal to{" "}
            <strong style={{ color: "#ffffff" }}>
              {preferences.primary_goal}
            </strong>
            .
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="card" style={{ padding: 28 }}>
          Unable to load learning paths: {error.message}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 20,
          }}
        >
          {rankedPaths.map((path, index) => {
            const modules = Array.isArray(path.modules)
              ? path.modules
              : [];

            const locked = path.is_pro && !isPro;

            return (
              <article
                key={path.id}
                className="card"
                style={{
                  padding: 26,
                  border:
                    index === 0
                      ? "1px solid rgba(34,197,94,0.28)"
                      : path.is_featured
                        ? "1px solid rgba(96,165,250,0.3)"
                        : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  {index === 0 && preferences ? (
                    <span style={recommendedBadgeStyle}>
                      RECOMMENDED
                    </span>
                  ) : null}

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

                <h2
                  style={{
                    margin: 0,
                    fontSize: 28,
                    lineHeight: 1.2,
                  }}
                >
                  {path.title}
                </h2>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {path.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 16,
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
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#60a5fa",
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    Outcome
                  </p>

                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "rgba(255,255,255,0.82)",
                      lineHeight: 1.6,
                      fontSize: 14,
                    }}
                  >
                    {path.outcome}
                  </p>
                </div>

                <div style={{ marginTop: 20 }}>
                  {locked ? (
                    <Link
                      href="/upgrade"
                      className="btn btn-primary"
                    >
                      Unlock Learning Path
                    </Link>
                  ) : (
                    <Link
                      href={`/learn/${path.slug}`}
                      className="btn btn-primary"
                    >
                      Open Learning Path →
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

const recommendedBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.24)",
  color: "#bbf7d0",
  fontSize: 11,
  fontWeight: 800,
};

const featuredBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(37,99,235,0.18)",
  border: "1px solid rgba(96,165,250,0.3)",
  color: "#bfdbfe",
  fontSize: 11,
  fontWeight: 800,
};

const proBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  color: "#dbeafe",
  fontSize: 11,
  fontWeight: 800,
};

const freeBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.08)",
  color: "#bbf7d0",
  fontSize: 11,
  fontWeight: 800,
};

const metricPillStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 700,
};