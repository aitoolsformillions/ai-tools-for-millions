"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toggleFavorite } from "@/app/(app)/favorites/actions";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Tool = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  pricing_model: string | null;
  rating: number | null;
  categories: Category[];
};

type ToolsSearchProps = {
  tools: Tool[];
  favoriteToolIds: string[];
  isSignedIn: boolean;
};

export function ToolsSearch({
  tools,
  favoriteToolIds,
  isSignedIn,
}: ToolsSearchProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const categoryMap = new Map<string, Category>();

    tools.forEach((tool) => {
      tool.categories.forEach((category) => {
        categoryMap.set(category.id, category);
      });
    });

    return Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [tools]);

  const filteredTools = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesSearch =
        !term ||
        tool.name.toLowerCase().includes(term) ||
        tool.tagline?.toLowerCase().includes(term) ||
        tool.description?.toLowerCase().includes(term) ||
        tool.pricing_model?.toLowerCase().includes(term) ||
        tool.categories.some((category) =>
          category.name.toLowerCase().includes(term)
        );

      const matchesCategory =
        selectedCategory === "all" ||
        tool.categories.some(
          (category) => category.slug === selectedCategory
        );

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, tools]);

  const favorites = new Set(favoriteToolIds);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          margin: "4px 0 18px",
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          style={categoryButtonStyle(selectedCategory === "all")}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.slug)}
            style={categoryButtonStyle(
              selectedCategory === category.slug
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      <input
        aria-label="Search AI tools"
        placeholder="Try: ChatGPT, research, video, free..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{
          width: "100%",
          margin: "10px 0 18px",
          minHeight: 58,
          borderRadius: 16,
          border: "1px solid var(--line)",
          background: "var(--surface)",
          color: "var(--text)",
          padding: "0 18px",
        }}
      />

      <p
        style={{
          margin: "0 0 18px",
          color: "var(--muted)",
          fontSize: 14,
        }}
      >
        {filteredTools.length} tool
        {filteredTools.length === 1 ? "" : "s"} found
      </p>

      <div
        className="grid"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {filteredTools.map((tool) => {
          const isFavorite = favorites.has(tool.id);

          return (
            <article
              key={tool.id}
              className="card"
              style={{ padding: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {tool.categories.map((category) => (
                  <span
                    key={category.id}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(96,165,250,0.12)",
                      border: "1px solid rgba(96,165,250,0.24)",
                      color: "#93c5fd",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              <h2 style={{ margin: "12px 0 8px", fontSize: 24 }}>
                {tool.name}
              </h2>

              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
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

                {isSignedIn ? (
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
    </>
  );
}

function categoryButtonStyle(active: boolean) {
  return {
    padding: "9px 13px",
    borderRadius: 999,
    border: active
      ? "1px solid rgba(96,165,250,0.72)"
      : "1px solid rgba(255,255,255,0.14)",
    background: active
      ? "rgba(37,99,235,0.26)"
      : "rgba(255,255,255,0.04)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  };
}