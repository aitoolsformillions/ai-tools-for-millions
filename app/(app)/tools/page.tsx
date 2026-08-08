import { createClient } from "@/lib/supabase/server";
import { ToolsSearch } from "@/components/tools-search";

export default async function ToolsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tools, error } = await supabase
  .from("ai_tools")
  .select(`
    id,
    name,
    slug,
    tagline,
    description,
    pricing_model,
    rating,
    is_featured,
    is_trending,
    tool_categories (
      categories (
        id,
        name,
        slug
      )
    )
  `)
  .eq("status", "published")
  .order("rating", { ascending: false });

  let favoriteToolIds: string[] = [];

  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("tool_id")
      .eq("user_id", user.id);

    favoriteToolIds =
      favorites?.map((favorite) => favorite.tool_id) ?? [];
  }

  const normalizedTools =
  tools?.map((tool) => ({
    ...tool,
    categories:
      tool.tool_categories?.flatMap((item) =>
        Array.isArray(item.categories)
          ? item.categories
          : item.categories
            ? [item.categories]
            : []
      ) ?? [],
  })) ?? [];

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
        <ToolsSearch
          tools={normalizedTools}
          favoriteToolIds={favoriteToolIds}
          isSignedIn={Boolean(user)}
        />
      )}
    </section>
  );
}