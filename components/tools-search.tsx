"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toggleFavorite } from "@/app/(app)/favorites/actions";

type Tool = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  pricing_model: string | null;
  rating: number | null;
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

  const filteredTools = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return tools;
    }

    return tools.filter((tool) => {
      return (
        tool.name.toLowerCase().includes(term) ||
        tool.tagline?.toLowerCase().includes(term) ||
        tool.description?.toLowerCase().includes(term) ||
        tool.pricing_model?.toLowerCase().includes(term)
      );
    });
  }, [search, tools]);

  const favorites = new Set(favoriteToolIds);

  return (
    <>
      <input
        aria-label="Search AI tools"
        placeholder="Try: ChatGPT, research, video, free..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
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

      <p
        style={{
          margin: "0 0 18px",
          color: "var(--muted)",
          fontSize: 14,
        }}
      >
        {filteredTools.length} tool{filteredTools.length === 1 ? "" : "s"} found
      </p>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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
              <span
                style={{
                  color: "var(--blue-2)",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {tool.pricing_model ?? "AI TOOL"}
              </span>

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