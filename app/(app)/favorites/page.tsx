import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
      id,
      created_at,
      ai_tools (
        id,
        name,
        slug,
        tagline,
        pricing_model,
        website_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section>
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            margin: 0,
            color: "#60a5fa",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Your Collection
        </p>

        <h1
          style={{
            margin: "8px 0 0",
            fontSize: "clamp(30px, 5vw, 48px)",
            lineHeight: 1.05,
          }}
        >
          Favorite AI Tools
        </h1>

        <p
          style={{
            maxWidth: "680px",
            margin: "14px 0 0",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.7,
          }}
        >
          Save useful AI tools here so you can quickly return to them later.
        </p>
      </div>

      {error ? (
        <div style={messageCardStyle}>
          We could not load your favorites. Please refresh the page.
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
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
              <article key={favorite.id} style={toolCardStyle}>
                <p
                  style={{
                    margin: 0,
                    color: "#93c5fd",
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {tool.pricing_model || "AI Tool"}
                </p>

                <h2 style={{ margin: "12px 0 8px", fontSize: "23px" }}>
                  {tool.name}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.66)",
                    lineHeight: 1.65,
                  }}
                >
                  {tool.tagline || "Explore this saved AI tool."}
                </p>

                <Link
                  href={`/tools/${tool.slug}`}
                  style={{
                    display: "inline-flex",
                    marginTop: "22px",
                    color: "#ffffff",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  View Tool →
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={messageCardStyle}>
          <h2 style={{ margin: 0, fontSize: "24px" }}>
            No favorites saved yet
          </h2>

          <p
            style={{
              margin: "12px 0 22px",
              color: "rgba(255,255,255,0.64)",
              lineHeight: 1.7,
            }}
          >
            Browse the marketplace and save the tools that can help you work,
            create, and earn more efficiently.
          </p>

          <Link
            href="/tools"
            style={{
              display: "inline-flex",
              padding: "12px 18px",
              borderRadius: "12px",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Explore AI Tools
          </Link>
        </div>
      )}
    </section>
  );
}

const toolCardStyle = {
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.045)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.2)",
};

const messageCardStyle = {
  maxWidth: "720px",
  padding: "30px",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.045)",
};