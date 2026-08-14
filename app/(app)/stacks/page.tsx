import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StacksPage() {
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

  const { data: stacks, error } = await supabase
    .from("ai_stacks")
    .select(`
      id,
      name,
      slug,
      description,
      goal,
      is_premium
    `)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Stacks load error:",
      error.message
    );
  }

  const availableStacks = stacks ?? [];

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1300,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          marginBottom: 28,
        }}
      >
        <p style={blueEyebrowStyle}>
          AI Stacks
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(36px, 8vw, 66px)",
            letterSpacing: "-.05em",
            lineHeight: 1.04,
            overflowWrap: "anywhere",
          }}
        >
          Use AI tools together, not one at a time.
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            maxWidth: 840,
            color: "var(--muted)",
            fontSize: "clamp(16px, 3vw, 18px)",
            lineHeight: 1.7,
          }}
        >
          AI Stacks combine multiple tools into practical
          workflows so you can move from a goal to a repeatable
          process faster.
        </p>
      </div>

      <div
        style={{
          ...standardCardStyle,
          marginBottom: 22,
          border:
            "1px solid rgba(96,165,250,0.2)",
        }}
      >
        <p style={blueEyebrowStyle}>
          Workflow Library
        </p>

        <p
          style={{
            margin: "8px 0 0",
            color: "var(--muted)",
            lineHeight: 1.65,
          }}
        >
          Open a Stack to see which AI tools work together,
          what the workflow is designed to accomplish, and how
          to move through it step by step.
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
            {availableStacks.length}{" "}
            {availableStacks.length === 1
              ? "stack"
              : "stacks"}
          </span>

          <span style={metricPillStyle}>
            Guided workflows
          </span>
        </div>
      </div>

      {error ? (
        <div style={standardCardStyle}>
          <p style={blueEyebrowStyle}>
            Unable to Load
          </p>

          <h2 style={sectionHeadingStyle}>
            AI Stacks are temporarily unavailable.
          </h2>

          <p style={sectionTextStyle}>
            Please refresh the page and try again.
          </p>
        </div>
      ) : availableStacks.length === 0 ? (
        <div style={standardCardStyle}>
          <p style={blueEyebrowStyle}>
            AI Stacks
          </p>

          <h2 style={sectionHeadingStyle}>
            No AI Stacks are available yet.
          </h2>

          <p style={sectionTextStyle}>
            New workflows will appear here as they are added to
            the AITFM library.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 16,
          }}
        >
          {availableStacks.map((stack) => {
            const locked =
              stack.is_premium && !isPro;

            return (
              <article
                key={stack.id}
                className="card"
                style={{
                  minWidth: 0,
                  padding:
                    "clamp(20px, 4vw, 26px)",
                  display: "flex",
                  flexDirection: "column",
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
                  <span style={stackBadgeStyle}>
                    AI STACK
                  </span>

                  {stack.is_premium ? (
                    <span style={proBadgeStyle}>
                      PRO
                    </span>
                  ) : (
                    <span style={freeBadgeStyle}>
                      FREE
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "clamp(24px, 5vw, 30px)",
                    lineHeight: 1.15,
                    overflowWrap: "anywhere",
                  }}
                >
                  {stack.name}
                </h2>

                {stack.goal ? (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 14,
                      borderRadius: 14,
                      background:
                        "rgba(37,99,235,0.06)",
                      border:
                        "1px solid rgba(96,165,250,0.14)",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#93c5fd",
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      Goal
                    </p>

                    <p
                      style={{
                        margin: "6px 0 0",
                        color:
                          "rgba(255,255,255,0.84)",
                        lineHeight: 1.55,
                        fontSize: 14,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {stack.goal}
                    </p>
                  </div>
                ) : null}

                <p
                  style={{
                    margin: "14px 0 0",
                    color: "var(--muted)",
                    lineHeight: 1.65,
                    overflowWrap: "anywhere",
                  }}
                >
                  {stack.description}
                </p>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 20,
                  }}
                >
                  {locked ? (
                    <Link
                      href="/upgrade"
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      Unlock AI Stack
                    </Link>
                  ) : (
                    <Link
                      href={`/stacks/${stack.slug}`}
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      Open Workflow →
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

const standardCardStyle = {
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 20,
  border:
    "1px solid rgba(255,255,255,0.08)",
  background:
    "rgba(255,255,255,0.025)",
};

const sectionHeadingStyle = {
  margin: "8px 0 10px",
  fontSize:
    "clamp(26px, 6vw, 30px)",
  lineHeight: 1.15,
};

const sectionTextStyle = {
  margin: 0,
  color: "var(--muted)",
  lineHeight: 1.7,
};

const blueEyebrowStyle = {
  margin: 0,
  color: "#60a5fa",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const stackBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background:
    "rgba(37,99,235,0.12)",
  border:
    "1px solid rgba(96,165,250,0.2)",
  color: "#bfdbfe",
  fontSize: 11,
  fontWeight: 800,
};

const proBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background:
    "rgba(255,255,255,0.05)",
  border:
    "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 11,
  fontWeight: 800,
};

const freeBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background:
    "rgba(34,197,94,0.08)",
  border:
    "1px solid rgba(34,197,94,0.14)",
  color: "#bbf7d0",
  fontSize: 11,
  fontWeight: 800,
};

const metricPillStyle = {
  maxWidth: "100%",
  padding: "7px 10px",
  borderRadius: 999,
  background:
    "rgba(255,255,255,0.05)",
  border:
    "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 700,
  overflowWrap: "anywhere" as const,
};