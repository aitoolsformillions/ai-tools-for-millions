import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    profileResult,
    toolsResult,
    favoritesResult,
    categoriesResult,
    recommendedResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("ai_tools")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),

    supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),

    supabase
      .from("categories")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("ai_tools")
      .select("id, name, slug, tagline, rating")
      .eq("status", "published")
      .order("rating", { ascending: false })
      .limit(3),
  ]);

  const displayName =
    profileResult.data?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "there";

  const totalTools = toolsResult.count ?? 0;
  const savedTools = favoritesResult.count ?? 0;
  const totalCategories = categoriesResult.count ?? 0;
  const recommendedTools = recommendedResult.data ?? [];

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 36,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Member Dashboard
          </p>

          <h1
            style={{
              margin: "10px 0 0",
              fontSize: "clamp(36px, 6vw, 58px)",
              letterSpacing: "-.045em",
              lineHeight: 1.05,
            }}
          >
            Welcome back, {displayName}.
          </h1>

          <p
            style={{
              margin: "14px 0 0",
              maxWidth: 700,
              color: "var(--muted)",
              fontSize: 18,
              lineHeight: 1.7,
            }}
          >
            Discover AI tools, build your personal stack, and keep your
            favorites organized in one place.
          </p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Sign Out
          </button>
        </form>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
          marginBottom: 36,
        }}
      >
        <DashboardStat
          label="Available AI Tools"
          value={totalTools}
          description="Published tools ready to explore"
          href="/tools"
        />

        <DashboardStat
          label="My Saved Tools"
          value={savedTools}
          description="Tools in your personal AI stack"
          href="/favorites"
        />

        <DashboardStat
          label="Categories"
          value={totalCategories}
          description="Ways to discover the right AI"
          href="/tools"
        />

        <DashboardStat
          label="Account"
          value="Active"
          description="Your member profile is ready"
          href="/profile"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
          gap: 20,
        }}
      >
        <div className="card" style={{ padding: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#60a5fa",
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                Recommended
              </p>

              <h2 style={{ margin: "8px 0 0", fontSize: 28 }}>
                Top AI tools to explore
              </h2>
            </div>

            <Link
              href="/tools"
              style={{
                color: "#93c5fd",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              View All →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {recommendedTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                style={{
                  display: "block",
                  padding: 18,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.035)",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20 }}>
                      {tool.name}
                    </h3>

                    <p
                      style={{
                        margin: "7px 0 0",
                        color: "var(--muted)",
                        lineHeight: 1.6,
                      }}
                    >
                      {tool.tagline}
                    </p>
                  </div>

                  <span
                    style={{
                      whiteSpace: "nowrap",
                      color: "#facc15",
                      fontWeight: 700,
                    }}
                  >
                    ★ {tool.rating ?? "New"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <p
            style={{
              margin: 0,
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Quick Actions
          </p>

          <h2 style={{ margin: "8px 0 20px", fontSize: 28 }}>
            Keep building your AI stack
          </h2>

          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <QuickLink
              href="/tools"
              title="Explore AI Tools"
              description="Search and filter the marketplace."
            />

            <QuickLink
              href="/favorites"
              title="View Favorites"
              description="Return to the tools you've saved."
            />

            <QuickLink
              href="/profile"
              title="Your Profile"
              description="Review your member information."
            />

            <QuickLink
              href="/settings"
              title="Account Settings"
              description="Manage password and security."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardStat({
  label,
  value,
  description,
  href,
}: {
  label: string;
  value: string | number;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card"
      style={{
        padding: 24,
        color: "#ffffff",
        textDecoration: "none",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "10px 0 8px",
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        {value}
      </p>

      <p
        style={{
          margin: 0,
          color: "var(--muted)",
          lineHeight: 1.5,
          fontSize: 14,
        }}
      >
        {description}
      </p>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.035)",
        color: "#ffffff",
        textDecoration: "none",
      }}
    >
      <strong>{title}</strong>

      <p
        style={{
          margin: "5px 0 0",
          color: "var(--muted)",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </Link>
  );
}