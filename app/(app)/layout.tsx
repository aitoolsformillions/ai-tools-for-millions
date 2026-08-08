import Link from "next/link";
import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        background:
          "radial-gradient(circle at top, #101b3d 0%, #050816 45%, #02030a 100%)",
        color: "#ffffff",
      }}
    >
      <aside
        style={{
          minHeight: "100vh",
          padding: "28px 20px",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(3, 7, 18, 0.88)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "block",
            marginBottom: "36px",
            color: "#ffffff",
            fontSize: "21px",
            fontWeight: 800,
            textDecoration: "none",
            lineHeight: 1.2,
          }}
        >
          AI Tools
          <br />
          for Millions
        </Link>

        <nav
          aria-label="Main application navigation"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Link href="/dashboard" style={navigationLinkStyle}>
            Dashboard
          </Link>

          <Link href="/tools" style={navigationLinkStyle}>
            Explore AI Tools
          </Link>

          <Link href="/favorites" style={navigationLinkStyle}>
            Favorites
          </Link>
<Link href="/stacks" style={navigationLinkStyle}>
  AI Stacks
</Link>
          <Link href="/profile" style={navigationLinkStyle}>
            Profile
          </Link>

          <Link href="/settings" style={navigationLinkStyle}>
            Settings
          </Link>
          <Link
  href="/upgrade"
  style={{
    ...navigationLinkStyle,
    marginTop: "14px",
    border: "1px solid rgba(96,165,250,0.38)",
    background: "rgba(37,99,235,0.14)",
    color: "#bfdbfe",
  }}
>
  ★ Upgrade to Pro
</Link>
          
        </nav>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header
          style={{
            minHeight: "76px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            padding: "16px 32px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(2, 6, 23, 0.68)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div>
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
              AI Tools for Millions
            </p>

            <p
              style={{
                margin: "4px 0 0",
                color: "rgba(255,255,255,0.62)",
                fontSize: "14px",
              }}
            >
              Discover, learn, and build with AI.
            </p>
          </div>

          <div
            style={{
              width: "42px",
              height: "42px",
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              border: "1px solid rgba(96,165,250,0.45)",
              background: "rgba(37,99,235,0.18)",
              fontWeight: 800,
            }}
            aria-label="User account"
          >
            AI
          </div>
        </header>

        <main
          style={{
            width: "100%",
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "32px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

const navigationLinkStyle = {
  display: "block",
  padding: "12px 14px",
  borderRadius: "12px",
  color: "rgba(255,255,255,0.78)",
  textDecoration: "none",
  fontSize: "15px",
  fontWeight: 600,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid transparent",
};