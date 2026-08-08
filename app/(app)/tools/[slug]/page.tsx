import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { data: tool, error } = await supabase
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
    .single();

  if (error || !tool) {
    notFound();
  }

  const categories =
    tool.tool_categories?.flatMap((item) =>
      Array.isArray(item.categories)
        ? item.categories
        : item.categories
          ? [item.categories]
          : []
    ) ?? [];

  const destinationUrl =
    tool.affiliate_url || tool.website_url;

  return (
    <section>
      <Link
        href="/tools"
        style={{
          display: "inline-flex",
          marginBottom: 24,
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
          padding: "clamp(24px, 5vw, 56px)",
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
          {categories.map((category) => (
            <span
              key={category.id}
              style={{
                padding: "7px 11px",
                borderRadius: 999,
                background: "rgba(96,165,250,0.12)",
                border: "1px solid rgba(96,165,250,0.24)",
                color: "#93c5fd",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {category.name}
            </span>
          ))}
        </div>

        <h1
          style={{
            fontSize: "clamp(42px, 8vw, 72px)",
            letterSpacing: "-.05em",
            margin: "12px 0",
          }}
        >
          {tool.name}
        </h1>

        <p
          style={{
            margin: "0 0 12px",
            fontSize: 22,
            fontWeight: 700,
            color: "#dbeafe",
          }}
        >
          {tool.tagline}
        </p>

        <p
          style={{
            fontSize: 18,
            color: "var(--muted)",
            lineHeight: 1.8,
            maxWidth: 820,
          }}
        >
          {tool.description}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            margin: "28px 0",
          }}
        >
          <span
            className="glass"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
            }}
          >
            ★ {tool.rating ?? "New"}
          </span>

          <span
            className="glass"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
            }}
          >
            {tool.pricing_model ?? "Pricing varies"}
          </span>
        </div>

        {destinationUrl ? (
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn btn-primary"
          >
            Visit Official Website
          </a>
        ) : (
          <p style={{ color: "var(--muted)" }}>
            Official website coming soon.
          </p>
        )}
      </div>
    </section>
  );
}