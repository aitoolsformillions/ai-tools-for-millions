import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleFavorite } from "@/app/(app)/favorites/actions";

export default async function ToolsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tools, error } = await supabase
    .from("ai_tools")
    .select(
      "id, name, slug, tagline, description, pricing_model, website_url, rating"
    )
    .eq("status", "published")
    .order("rating", { ascending: false });

  let favoriteToolIds = new Set<string>();

  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("tool_id")
      .eq("user_id", user.id);

    favoriteToolIds = new Set(
      favorites?.map((favorite) => favorite.tool_id) ?? []
    );
  }

  return (
    <section>
      <div style={{ marginBottom: "30px" }}>
        <span
          style={{
            color: "var(--blue-2)",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          AI TOOL EXPLORER
        </span>

        <h1
          style={{
            fontSize: 56,
            letterSpacing: "-.04em",
            margin: "12px 0",
          }}
        >
          Find the right AI tool.
        </h1>

        <p
          style={{
            color: "var(--muted)",
            fontSize: 18,
          }}
        >
          Search, compare, and save tools for your exact workflow.
        </p>

        <input
          aria-label="Search AI tools"
          placeholder="Try: free AI for real estate marketing"
          style={{
            width: "100%",
            margin: "28px 0",
            minHeight: 58,
            borderRadius: 16,
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--text)",
            padding: "0 18px",
          }}
        />
      </div>

      {error ? (
        <div
          style={{
            padding: "24px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          Unable to load AI tools: {error.message}
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {tools?.map((tool) => {
            const isFavorite = favoriteToolIds.has(tool.id);

            return (
              <article
                key={tool.id}
                className="card"
                style={{ padding: 24 }}
              >
                <span
                  style={{
                    color: "var(--blue-2)",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {tool.pricing_model ?? "AI TOOL"}
                </span>

                <h2
                  style={{
                    margin: "12px 0 8px",
                    fontSize: 24,
                  }}
                >
                  {tool.name}
                </h2>

                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {tool.tagline ?? tool.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 18,
                  }}
                >
                  <span
                    className="glass"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                    }}
                  >
                    ★ {tool.rating ?? "New"}
                  </span>

                  <Link
                    href={`/tools/${tool.slug}`}
                    className="btn btn-primary"
                  >
                    View Tool
                  </Link>

                  {user ? (
                    <form action={toggleFavorite}>
                      <input
                        type="hidden"
                        name="toolId"
                        value={tool.id}
                      />

                      <button
                        type="submit"
                        style={{
                          minHeight: 40,
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: isFavorite
                            ? "1px solid rgba(96,165,250,0.65)"
                            : "1px solid rgba(255,255,255,0.16)",
                          background: isFavorite
                            ? "rgba(37,99,235,0.24)"
                            : "rgba(255,255,255,0.05)",
                          color: "#ffffff",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        {isFavorite ? "♥ Saved" : "♡ Save"}
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/login"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.16)",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      Sign in to save
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