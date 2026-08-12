import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OpportunitiesPage() {
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

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select(`
      id,
      title,
      slug,
      summary,
      target_customer,
      category,
      difficulty,
      startup_cost,
      time_to_launch,
      revenue_model,
      opportunity_score,
      is_pro,
      is_featured
    `)
    .eq("status", "published")
    .order("opportunity_score", { ascending: false });

  if (error) {
    console.error("Opportunity load error:", error.message);
  }

  const groups = [
    {
      title: "Make Money",
      description:
        "AI-assisted services, products, and business models designed around practical customer problems.",
      emoji: "💰",
    },
    {
      title: "Save Time",
      description:
        "Workflows that reduce repetitive work, improve efficiency, and help businesses operate with less manual effort.",
      emoji: "⚡",
    },
    {
      title: "Market Gaps",
      description:
        "Underserved problems and overlooked opportunities where AI may create a useful competitive advantage.",
      emoji: "🔎",
    },
  ];

  return (
    <section>
      <div style={{ marginBottom: 36 }}>
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
          Opportunity Engine
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(40px, 7vw, 68px)",
            letterSpacing: "-.05em",
            lineHeight: 1.04,
          }}
        >
          Find practical ways to use AI.
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            maxWidth: 800,
            color: "var(--muted)",
            fontSize: 18,
            lineHeight: 1.75,
          }}
        >
          Explore AI-powered opportunities built around making money,
          improving efficiency, and identifying underserved market needs.
        </p>
      </div>

      {error ? (
        <div className="card" style={{ padding: 28 }}>
          Unable to load opportunities: {error.message}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 34 }}>
          {groups.map((group) => {
            const groupOpportunities =
              opportunities?.filter(
                (opportunity) => opportunity.category === group.title
              ) ?? [];

            return (
              <section key={group.title}>
                <div style={{ marginBottom: 18 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 30,
                    }}
                  >
                    {group.emoji} {group.title}
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "var(--muted)",
                      lineHeight: 1.65,
                      maxWidth: 760,
                    }}
                  >
                    {group.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 18,
                  }}
                >
                  {groupOpportunities.map((opportunity) => {
                    const locked = opportunity.is_pro && !isPro;

                    return (
                      <article
                        key={opportunity.id}
                        className="card"
                        style={{
                          padding: 24,
                          border: opportunity.is_featured
                            ? "1px solid rgba(96,165,250,0.4)"
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
                          {opportunity.is_featured ? (
                            <span
                              style={{
                                padding: "6px 10px",
                                borderRadius: 999,
                                background: "rgba(37,99,235,0.18)",
                                border:
                                  "1px solid rgba(96,165,250,0.32)",
                                color: "#bfdbfe",
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              ★ FEATURED
                            </span>
                          ) : null}

                          {opportunity.is_pro ? (
                            <span
                              style={{
                                padding: "6px 10px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.05)",
                                color: "#dbeafe",
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              PRO
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: "6px 10px",
                                borderRadius: 999,
                                background: "rgba(34,197,94,0.08)",
                                color: "#bbf7d0",
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              FREE
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 16,
                            alignItems: "flex-start",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: 23,
                              lineHeight: 1.25,
                            }}
                          >
                            {opportunity.title}
                          </h3>

                          <span
                            style={{
                              whiteSpace: "nowrap",
                              color: "#facc15",
                              fontWeight: 800,
                            }}
                          >
                            {opportunity.opportunity_score ?? "—"}/10
                          </span>
                        </div>

                        <p
                          style={{
                            margin: "12px 0 0",
                            color: "var(--muted)",
                            lineHeight: 1.7,
                          }}
                        >
                          {opportunity.summary}
                        </p>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(2, minmax(0, 1fr))",
                            gap: 10,
                            marginTop: 18,
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
                            label="Best For"
                            value={opportunity.target_customer}
                          />
                        </div>

                        <div style={{ marginTop: 20 }}>
                          {locked ? (
                            <Link
                              href="/upgrade"
                              className="btn btn-primary"
                            >
                              Unlock Opportunity
                            </Link>
                          ) : (
                            <Link
                              href={`/opportunities/${opportunity.slug}`}
                              className="btn btn-primary"
                            >
                              View Opportunity →
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
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
        padding: 12,
        borderRadius: 12,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "var(--muted)",
          fontSize: 11,
          textTransform: "uppercase",
          fontWeight: 800,
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "5px 0 0",
          color: "#ffffff",
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {value}
      </p>
    </div>
  );
}