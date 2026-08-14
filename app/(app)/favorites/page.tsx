import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(`
      user_id,
      tool_id,
      created_at,
      ai_tools (
        id,
        name,
        slug,
        tagline,
        pricing_model,
        website_url,
        rating
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1300,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <p style={eyebrowStyle}>
          Your Collection
        </p>

        <h1
          style={{
            margin: "8px 0 0",
            fontSize: "clamp(34px, 8vw, 52px)",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            overflowWrap: "anywhere",
          }}
        >
          Favorite AI Tools
        </h1>

        <p
          style={{
            maxWidth: 700,
            margin: "14px 0 0",
            color: "var(--muted)",
            fontSize: "clamp(16px, 3vw, 18px)",
            lineHeight: 1.7,
          }}
        >
          Keep useful AI tools in one place so you can quickly
          return to the ones that support your workflows,
          learning, and opportunities.
        </p>
      </div>

      {error ? (
        <div style={errorCardStyle}>
          <p style={errorEyebrowStyle}>
            Unable to Load
          </p>

          <h2
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(26px, 6vw, 32px)",
            }}
          >
            We couldn’t load your saved tools.
          </h2>

          <p
            style={{
              margin: "12px 0 0",
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            Your saved data has not been removed. Refresh the
            page and try again.
          </p>
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 16,
          }}
        >
          {favorites.map((favorite) => {
            const tool = Array.isArray(favorite.ai_tools)
              ? favorite.ai_tools[0]
              : favorite.ai_tools;

            if (!tool) {
              return null;
            }

            return (
              <article
                key={`${favorite.user_id}-${favorite.tool_id}`}
                style={toolCardStyle}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={savedBadgeStyle}>
                    SAVED TOOL
                  </span>

                  <span style={ratingPillStyle}>
                    ★ {tool.rating ?? "New"}
                  </span>
                </div>

                <p
                  style={{
                    margin: "16px 0 0",
                    color: "#93c5fd",
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {tool.pricing_model || "AI Tool"}
                </p>

                <h2
                  style={{
                    margin: "8px 0 0",
                    fontSize: "clamp(23px, 5vw, 28px)",
                    lineHeight: 1.15,
                    overflowWrap: "anywhere",
                  }}
                >
                  {tool.name}
                </h2>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "var(--muted)",
                    lineHeight: 1.65,
                    overflowWrap: "anywhere",
                  }}
                >
                  {tool.tagline || "Explore this saved AI tool."}
                </p>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 20,
                    display: "grid",
                    gap: 10,
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

                  {tool.website_url ? (
                    <a
                      href={tool.website_url}
                      target="_blank"
                      rel="noreferrer"
                      style={secondaryLinkStyle}
                    >
                      Visit Official Website ↗
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          eyebrow="Build Your Toolkit"
          title="No favorite AI tools saved yet."
          description="Save tools you want to revisit so your best options stay easy to find as you build workflows, learn new skills, and test opportunities."
          primaryHref="/tools"
          primaryLabel="Explore AI Tools"
          secondaryHref="/opportunities"
          secondaryLabel="Explore Opportunities"
        />
      )}
    </section>
  );
}

const eyebrowStyle = {
  margin: 0,
  color: "#60a5fa",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
};

const toolCardStyle = {
  minWidth: 0,
  padding: "clamp(20px, 4vw, 24px)",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.16)",
  display: "flex",
  flexDirection: "column" as const,
};

const savedBadgeStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(34,197,94,0.08)",
  border: "1px solid rgba(34,197,94,0.18)",
  color: "#bbf7d0",
  fontSize: 11,
  fontWeight: 800,
};

const ratingPillStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 700,
};

const secondaryLinkStyle = {
  display: "flex",
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};

const errorCardStyle = {
  maxWidth: 760,
  padding: "clamp(24px, 5vw, 34px)",
  borderRadius: 20,
  border: "1px solid rgba(248,113,113,0.22)",
  background: "rgba(127,29,29,0.1)",
};

const errorEyebrowStyle = {
  margin: 0,
  color: "#fca5a5",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};