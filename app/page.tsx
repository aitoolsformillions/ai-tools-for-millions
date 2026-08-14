import Link from "next/link";
import { ToolCard } from "@/components/tool-card";
import { tools } from "@/data/tools";

const categories = [
  "Writing",
  "Marketing",
  "Video",
  "Image Generation",
  "Coding",
  "Productivity",
  "Automation",
  "Business",
];

const categoryIcons = [
  "✍",
  "📣",
  "🎬",
  "◈",
  "⌘",
  "✓",
  "⚡",
  "▣",
];

export default function Home() {
  return (
    <main>
      <section
        className="container"
        style={{
          padding: "90px 0 64px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          alignItems: "center",
          gap: 56,
        }}
      >
        <div>
          <span
            style={{
              color: "var(--blue-2)",
              fontWeight: 800,
              letterSpacing: ".13em",
              fontSize: 12,
            }}
          >
            THE PRACTICAL AI PLATFORM
          </span>

          <h1
            style={{
              fontSize: "clamp(46px, 8vw, 82px)",
              lineHeight: 0.98,
              letterSpacing: "-.055em",
              margin: "18px 0 24px",
              overflowWrap: "anywhere",
            }}
          >
            Build smarter with AI that you can
            actually use.
          </h1>

          <p
            style={{
              fontSize: 19,
              lineHeight: 1.7,
              color: "var(--muted)",
              maxWidth: 650,
            }}
          >
            Discover useful AI tools, build
            practical skills, follow proven
            workflows, and turn what you learn
            into real opportunities.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 30,
            }}
          >
            <Link
              className="btn btn-primary"
              href="/signup"
            >
              Start Building
            </Link>

            <Link
              className="btn btn-secondary"
              href="/login"
            >
              Sign In
            </Link>
          </div>

          <p
            style={{
              margin: "14px 0 0",
              color: "rgba(255,255,255,0.48)",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            New to AITFM? Start with a free
            account. Already a member? Sign in
            to continue.
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: 28,
            minHeight: 420,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "18% 12%",
              borderRadius: 36,
              border:
                "1px solid rgba(91,178,255,.4)",
              boxShadow:
                "0 0 80px rgba(22,139,255,.2)",
              transform: "rotate(-5deg)",
            }}
          />

          <div
            className="glass"
            style={{
              position: "absolute",
              top: 55,
              left: 28,
              padding: 18,
              borderRadius: 18,
            }}
          >
            🔎 Discover
          </div>

          <div
            className="glass"
            style={{
              position: "absolute",
              top: 148,
              right: 24,
              padding: 18,
              borderRadius: 18,
            }}
          >
            ⚡ Build
          </div>

          <div
            className="glass"
            style={{
              position: "absolute",
              bottom: 72,
              left: 52,
              padding: 18,
              borderRadius: 18,
            }}
          >
            ✦ Learn
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontSize: 72,
              fontWeight: 900,
            }}
          >
            A↑
          </div>
        </div>
      </section>

      <section
        className="container"
        style={{
          padding: "56px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 20,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                color: "var(--blue-2)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              CURATED PICKS
            </span>

            <h2
              style={{
                fontSize: "clamp(30px, 6vw, 38px)",
                margin: "8px 0 0",
              }}
            >
              Featured AI tools
            </h2>
          </div>

          <Link
            href="/signup"
            style={{
              color: "var(--blue-2)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Join to explore all →
          </Link>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 245px), 1fr))",
          }}
        >
          {tools.map((tool) => (
            <ToolCard
              key={tool.slug}
              tool={tool}
            />
          ))}
        </div>
      </section>

      <section
        className="container"
        style={{
          padding: "56px 0 90px",
        }}
      >
        <span
          style={{
            color: "var(--blue-2)",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          EXPLORE WHAT AI CAN DO
        </span>

        <h2
          style={{
            fontSize: "clamp(30px, 6vw, 38px)",
            margin: "8px 0 24px",
          }}
        >
          Browse by category
        </h2>

        <div
          className="grid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
          }}
        >
          {categories.map(
            (category, index) => (
              <div
                className="card"
                key={category}
                style={{
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    marginBottom: 28,
                  }}
                >
                  {categoryIcons[index]}
                </div>

                <strong>{category}</strong>

                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                  }}
                >
                  Discover useful AI tools and
                  applications.
                </p>
              </div>
            )
          )}
        </div>

        <div
          style={{
            marginTop: 34,
            padding: "clamp(24px, 5vw, 34px)",
            borderRadius: 20,
            border:
              "1px solid rgba(96,165,250,0.18)",
            background:
              "rgba(37,99,235,0.05)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize:
                "clamp(27px, 6vw, 38px)",
            }}
          >
            Ready to put AI to work?
          </h2>

          <p
            style={{
              margin: "12px auto 0",
              maxWidth: 650,
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            Create your account and AITFM will
            help you start learning, discovering
            tools, and finding practical ways to
            use AI.
          </p>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Link
              href="/signup"
              className="btn btn-primary"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}