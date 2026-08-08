import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StacksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("id", user.id)
    .maybeSingle();

  const isPro = profile?.membership_tier === "pro";

  const { data: stacks, error } = await supabase
    .from("ai_stacks")
    .select(`
      id,
      name,
      slug,
      description,
      goal,
      is_premium,
      status,
      ai_stack_tools (
        position,
        ai_tools (
          id,
          name,
          slug,
          tagline,
          pricing_model,
          rating
        )
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  return (
    <section>
      <div style={{ marginBottom: 34 }}>
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
          AI Stacks
        </p>

        <h1
          style={{
            margin: "10px 0 0",
            fontSize: "clamp(38px, 7vw, 64px)",
            letterSpacing: "-.045em",
            lineHeight: 1.05,
          }}
        >
          Stop guessing which AI tools work together.
        </h1>

        <p
          style={{
            margin: "16px 0 0",
            maxWidth: 780,
            color: "var(--muted)",
            fontSize: 18,
            lineHeight: 1.7,
          }}
        >
          AI Stacks organize multiple tools around a specific outcome so you
          can build a practical workflow instead of testing random tools one
          at a time.
        </p>
      </div>

      {error ? (
        <div className="card" style={{ padding: 26 }}>
          Unable to load AI Stacks: {error.message}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 22,
          }}
        >
          {stacks?.map((stack) => {
            const tools =
              stack.ai_stack_tools
                ?.sort((a, b) => a.position - b.position)
                .flatMap((item) =>
                  Array.isArray(item.ai_tools)
                    ? item.ai_tools
                    : item.ai_tools
                      ? [item.ai_tools]
                      : []
                ) ?? [];

            const locked = stack.is_premium && !isPro;

            return (
              <article
                key={stack.id}
                className="card"
                style={{
                  padding: 30,
                  border: stack.is_premium
                    ? "1px solid rgba(96,165,250,0.35)"
                    : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ maxWidth: 760 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}
                    >
                      {stack.is_premium ? (
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(37,99,235,0.18)",
                            border:
                              "1px solid rgba(96,165,250,0.35)",
                            color: "#bfdbfe",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          ★ PRO
                        </span>
                      ) : null}

                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.05)",
                          color: "var(--muted)",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {tools.length} tools
                      </span>
                    </div>

                    <h2
                      style={{
                        margin: 0,
                        fontSize: "clamp(28px, 4vw, 40px)",
                      }}
                    >
                      {stack.name}
                    </h2>

                    <p
                      style={{
                        margin: "12px 0 0",
                        color: "var(--muted)",
                        fontSize: 17,
                        lineHeight: 1.7,
                      }}
                    >
                      {stack.description}
                    </p>

                    <p
                      style={{
                        margin: "14px 0 0",
                        color: "#dbeafe",
                        lineHeight: 1.65,
                      }}
                    >
                      <strong>Goal:</strong> {stack.goal}
                    </p>
                  </div>

                  {locked ? (
                    <Link
                      href="/upgrade"
                      className="btn btn-primary"
                    >
                      Unlock with Pro
                    </Link>
                  ) : (
                    <span
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: "rgba(34,197,94,0.12)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        color: "#bbf7d0",
                        fontWeight: 700,
                      }}
                    >
                      Access Unlocked
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 14,
                    marginTop: 26,
                  }}
                >
                  {tools.map((tool, index) => (
                    <div
                      key={tool.id}
                      style={{
                        padding: 18,
                        borderRadius: 16,
                        border:
                          "1px solid rgba(255,255,255,0.1)",
                        background: locked
                          ? "rgba(255,255,255,0.025)"
                          : "rgba(255,255,255,0.045)",
                        opacity: locked ? 0.6 : 1,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: "#60a5fa",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        STEP {index + 1}
                      </p>

                      <h3 style={{ margin: "8px 0 6px" }}>
                        {tool.name}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "var(--muted)",
                          lineHeight: 1.55,
                          fontSize: 14,
                        }}
                      >
                        {locked
                          ? "Upgrade to Pro to unlock the full workflow."
                          : tool.tagline}
                      </p>

                      {!locked ? (
                        <Link
                          href={`/tools/${tool.slug}`}
                          style={{
                            display: "inline-flex",
                            marginTop: 14,
                            color: "#93c5fd",
                            textDecoration: "none",
                            fontWeight: 700,
                          }}
                        >
                          View Tool →
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}