import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ToolsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tools, error } = await supabase
    .from("ai_tools")
    .select(`
      id,
      name,
      slug,
      tagline,
      pricing_model,
      rating
    `)
    .order("rating", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Tools load error:",
      error.message
    );
  }

  const { data: favorites, error: favoritesError } =
    await supabase
      .from("favorites")
      .select("tool_id")
      .eq("user_id", user.id);

  if (favoritesError) {
    console.error(
      "Favorites load error:",
      favoritesError.message
    );
  }

  const favoriteToolIds = new Set(
    (favorites ?? []).map(
      (favorite) => favorite.tool_id
    )
  );

  const availableTools = tools ?? [];

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
          AI Tool Discovery
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize:
              "clamp(36px, 8vw, 66px)",
            letterSpacing: "-.05em",
            lineHeight: 1.04,
            overflowWrap: "anywhere",
          }}
        >
          Find the right AI tool for the job.
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            maxWidth: 840,
            color: "var(--muted)",
            fontSize:
              "clamp(16px, 3vw, 18px)",
            lineHeight: 1.7,
          }}
        >
          Explore AI tools that can help you
          research, create, automate, organize,
          and build more efficient workflows.
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
          Tool Library
        </p>

        <p
          style={{
            margin: "8px 0 0",
            color: "var(--muted)",
            lineHeight: 1.65,
          }}
        >
          Browse the current AITFM tool library.
          Open any tool to learn more about how it
          can fit into practical AI workflows.
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
            {availableTools.length}{" "}
            {availableTools.length === 1
              ? "tool"
              : "tools"}
          </span>

          <span style={metricPillStyle}>
            {favoriteToolIds.size} saved
          </span>
        </div>
      </div>

      {error ? (
        <div style={standardCardStyle}>
          <p style={blueEyebrowStyle}>
            Unable to Load
          </p>

          <h2 style={sectionHeadingStyle}>
            AI tools are temporarily unavailable.
          </h2>

          <p style={sectionTextStyle}>
            Please refresh the page and try again.
          </p>
        </div>
      ) : availableTools.length === 0 ? (
        <div style={standardCardStyle}>
          <p style={blueEyebrowStyle}>
            AI Tool Discovery
          </p>

          <h2 style={sectionHeadingStyle}>
            No AI tools are available yet.
          </h2>

          <p style={sectionTextStyle}>
            Tools will appear here as they are
            added to the AITFM library.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 16,
          }}
        >
          {availableTools.map((tool) => {
            const isFavorite =
              favoriteToolIds.has(tool.id);

            return (
              <article
                key={tool.id}
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
                    justifyContent:
                      "space-between",
                    gap: 10,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={toolBadgeStyle}>
                    AI TOOL
                  </span>

                  {isFavorite ? (
                    <span style={savedBadgeStyle}>
                      SAVED
                    </span>
                  ) : null}
                </div>

                <h2
                  style={{
                    margin: "16px 0 0",
                    fontSize:
                      "clamp(24px, 5vw, 30px)",
                    lineHeight: 1.15,
                    overflowWrap: "anywhere",
                  }}
                >
                  {tool.name}
                </h2>

                {tool.tagline ? (
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "var(--muted)",
                      lineHeight: 1.65,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {tool.tagline}
                  </p>
                ) : (
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "var(--muted)",
                      lineHeight: 1.65,
                    }}
                  >
                    Explore this AI tool and see
                    where it can fit into your
                    workflows.
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 16,
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

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 20,
                  }}
                >
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    View Tool →
                  </Link>
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

const toolBadgeStyle = {
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

const savedBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background:
    "rgba(34,197,94,0.08)",
  border:
    "1px solid rgba(34,197,94,0.18)",
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