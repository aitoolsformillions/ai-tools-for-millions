import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  addToolFavorite,
  removeToolFavorite,
} from "@/app/(app)/tools/actions";

type ToolDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ToolDetailPage({
  params,
}: ToolDetailPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tool, error } =
    await supabase
      .from("ai_tools")
      .select(`
        id,
        name,
        slug,
        tagline,
        description,
        pricing_model,
        website_url,
        affiliate_url,
        rating,
        status,
        tool_categories (
          categories (
            id,
            name,
            slug
          )
        )
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

  if (error) {
    console.error(
      "Tool detail load error:",
      error.message
    );
  }

  if (error || !tool) {
    notFound();
  }

  const { data: favorite } =
    await supabase
      .from("favorites")
      .select("tool_id")
      .eq("user_id", user.id)
      .eq("tool_id", tool.id)
      .maybeSingle();

  const isFavorite = Boolean(favorite);

  const categories =
    tool.tool_categories?.flatMap(
      (item) =>
        Array.isArray(
          item.categories
        )
          ? item.categories
          : item.categories
            ? [item.categories]
            : []
    ) ?? [];

  const destinationUrl =
    tool.affiliate_url ||
    tool.website_url;

  return (
    <section
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <Link
        href="/tools"
        style={{
          display: "inline-flex",
          marginBottom: 20,
          color: "#93c5fd",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        ← Back to AI Tools
      </Link>

      <div
        className="card"
        style={{
          padding:
            "clamp(22px, 5vw, 50px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {categories.map(
              (category) => (
                <span
                  key={category.id}
                  style={categoryBadgeStyle}
                >
                  {category.name}
                </span>
              )
            )}
          </div>

          {isFavorite ? (
            <span style={savedBadgeStyle}>
              SAVED ✓
            </span>
          ) : null}
        </div>

        <h1
          style={{
            fontSize:
              "clamp(36px, 8vw, 68px)",
            letterSpacing: "-.05em",
            lineHeight: 1.04,
            margin: "18px 0 0",
            overflowWrap: "anywhere",
          }}
        >
          {tool.name}
        </h1>

        <p
          style={{
            margin: "14px 0 0",
            fontSize:
              "clamp(18px, 4vw, 22px)",
            fontWeight: 700,
            color: "#dbeafe",
            lineHeight: 1.5,
            overflowWrap: "anywhere",
          }}
        >
          {tool.tagline}
        </p>

        <p
          style={{
            margin: "14px 0 0",
            fontSize: 17,
            color: "var(--muted)",
            lineHeight: 1.75,
            maxWidth: 820,
            overflowWrap: "anywhere",
          }}
        >
          {tool.description}
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 24,
          }}
        >
          <span style={metricPillStyle}>
            ★ {tool.rating ?? "New"}
          </span>

          <span style={metricPillStyle}>
            {tool.pricing_model ??
              "Pricing varies"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 28,
          }}
        >
          {destinationUrl ? (
            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn btn-primary"
            >
              Visit Official Website ↗
            </a>
          ) : (
            <span
              style={{
                color:
                  "var(--muted)",
              }}
            >
              Official website coming
              soon.
            </span>
          )}

          {isFavorite ? (
            <form
              action={
                removeToolFavorite
              }
            >
              <FavoriteHiddenFields
                toolId={tool.id}
                toolSlug={tool.slug}
              />

              <button
                type="submit"
                style={
                  removeFavoriteButtonStyle
                }
              >
                Remove from Favorites
              </button>
            </form>
          ) : (
            <form
              action={addToolFavorite}
            >
              <FavoriteHiddenFields
                toolId={tool.id}
                toolSlug={tool.slug}
              />

              <button
                type="submit"
                style={
                  favoriteButtonStyle
                }
              >
                ☆ Add to Favorites
              </button>
            </form>
          )}
        </div>

        {isFavorite ? (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 14,
              border:
                "1px solid rgba(34,197,94,0.16)",
              background:
                "rgba(34,197,94,0.05)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#bbf7d0",
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              This tool is saved to
              your Favorites for quick
              access later.
            </p>

            <Link
              href="/favorites"
              style={{
                display:
                  "inline-flex",
                marginTop: 10,
                color: "#93c5fd",
                textDecoration:
                  "none",
                fontWeight: 700,
              }}
            >
              View Favorites →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FavoriteHiddenFields({
  toolId,
  toolSlug,
}: {
  toolId: string;
  toolSlug: string;
}) {
  return (
    <>
      <input
        type="hidden"
        name="toolId"
        value={toolId}
      />

      <input
        type="hidden"
        name="toolSlug"
        value={toolSlug}
      />
    </>
  );
}

const categoryBadgeStyle = {
  padding: "7px 11px",
  borderRadius: 999,
  background:
    "rgba(96,165,250,0.12)",
  border:
    "1px solid rgba(96,165,250,0.24)",
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 800,
};

const savedBadgeStyle = {
  padding: "7px 11px",
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
  padding: "9px 13px",
  borderRadius: 999,
  background:
    "rgba(255,255,255,0.05)",
  border:
    "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 13,
  fontWeight: 700,
};

const favoriteButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border:
    "1px solid rgba(96,165,250,0.28)",
  background:
    "rgba(37,99,235,0.08)",
  color: "#bfdbfe",
  fontWeight: 800,
  cursor: "pointer",
};

const removeFavoriteButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border:
    "1px solid rgba(248,113,113,0.2)",
  background:
    "rgba(127,29,29,0.08)",
  color: "#fecaca",
  fontWeight: 800,
  cursor: "pointer",
};