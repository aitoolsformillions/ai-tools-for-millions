import Link from "next/link";
import type { ReactNode } from "react";

const navigationLinkStyle = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 10,
  color: "#dbeafe",
  textDecoration: "none",
  fontWeight: 700,
};

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        background: "#020617",
      }}
    >
      <aside
        style={{
          minHeight: "100vh",
          padding: 24,
          borderRight:
            "1px solid rgba(255,255,255,0.08)",
          position: "sticky",
          top: 0,
          alignSelf: "start",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 900,
            fontSize: 20,
            display: "inline-block",
            marginBottom: 26,
          }}
        >
          AI Tools for Millions
        </Link>

        <nav
          style={{
            display: "grid",
            gap: 6,
          }}
        >
          <Link
            href="/dashboard"
            style={navigationLinkStyle}
          >
            Dashboard
          </Link>

          <Link
            href="/tools"
            style={navigationLinkStyle}
          >
            Explore AI Tools
          </Link>

          <Link
            href="/opportunities"
            style={navigationLinkStyle}
          >
            Opportunities
          </Link>

          <Link
            href="/learn"
            style={navigationLinkStyle}
          >
            Learn AI
          </Link>

          <Link
            href="/favorites"
            style={navigationLinkStyle}
          >
            Favorites
          </Link>

          <Link
            href="/stacks"
            style={navigationLinkStyle}
          >
            AI Stacks
          </Link>

          <Link
            href="/profile"
            style={navigationLinkStyle}
          >
            Profile
          </Link>

          <Link
            href="/settings"
            style={navigationLinkStyle}
          >
            Settings
          </Link>
        </nav>

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop:
              "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link
            href="/upgrade"
            style={{
              display: "block",
              padding: "11px 12px",
              borderRadius: 10,
              background: "rgba(37,99,235,0.14)",
              border:
                "1px solid rgba(96,165,250,0.22)",
              color: "#bfdbfe",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            ★ Upgrade to Pro
          </Link>
        </div>
      </aside>

      <main
        style={{
          minWidth: 0,
          padding: "40px clamp(24px, 5vw, 64px) 80px",
        }}
      >
        {children}
      </main>
    </div>
  );
}