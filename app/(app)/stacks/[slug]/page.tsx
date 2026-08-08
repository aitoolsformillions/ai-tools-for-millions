import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type StackDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StackDetailPage({
  params,
}: StackDetailPageProps) {
  const { slug } = await params;
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

  const { data: stack, error } = await supabase
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
        role,
        instructions,
        ai_tools (
          id,
          name,
          slug,
          tagline,
          pricing_model,
          rating,
          website_url
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !stack) {
    notFound();
  }

  const locked = stack.is_premium && !isPro;

  const steps =
    stack.ai_stack_tools
      ?.sort((a, b) => a.position - b.position)
      .flatMap((item) => {
        const tools = Array.isArray(item.ai_tools)
          ? item.ai_tools
          : item.ai_tools
            ? [item.ai_tools]
            : [];

        return tools.map((tool) => ({
          position: item.position,
          role: item.role,
          instructions: item.instructions,
          tool,
        }));
      }) ?? [];

  return (
    <section>
      <Link
        href="/stacks"
        style={{
          display: "inline-flex",
          marginBottom: 24,
          color: "#93c5fd",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        ← Back to AI Stacks
      </Link>

      <div
        className="card"
        style={{
          padding: "clamp(26px, 5vw, 52px)",
          marginBottom: 24,
          border: stack.is_premium
            ? "1px solid rgba(96,165,250,0.38)"
            : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {stack.is_premium ? (
            <span
              style={{
                padding: "7px 11px",
                borderRadius: 999,
                background: "rgba(37,99,235,0.18)",
                border: "1px solid rgba(96,165,250,0.35)",
                color: "#bfdbfe",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              ★ PRO WORKFLOW
            </span>
          ) : null}

          <span
            style={{
              padding: "7px 11px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.05)",
              color: "var(--muted)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {steps.length} steps
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(40px, 7vw, 68px)",
            letterSpacing: "-.05em",
            lineHeight: 1.04,
          }}
        >
          {stack.name}
        </h1>

        <p
          style={{
            margin: "18px 0 0",
            maxWidth: 820,
            color: "var(--muted)",
            fontSize: 19,
            lineHeight: 1.75,
          }}
        >
          {stack.description}
        </p>

        <div
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 16,
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.18)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#93c5fd",
              fontSize: 12,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Workflow Goal
          </p>

          <p
            style={{
              margin: "8px 0 0",
              color: "#ffffff",
              lineHeight: 1.65,
            }}
          >
            {stack.goal}
          </p>
        </div>

        {locked ? (
          <div
            style={{
              marginTop: 26,
              padding: 22,
              borderRadius: 16,
              border: "1px solid rgba(96,165,250,0.32)",
              background: "rgba(37,99,235,0.1)",
            }}
          >
            <h2 style={{ margin: 0 }}>This workflow is a Pro feature.</h2>

            <p
              style={{
                margin: "10px 0 18px",
                color: "var(--muted)",
                lineHeight: 1.65,
              }}
            >
              Upgrade to Pro to unlock the complete step-by-step workflow,
              tool roles, implementation instructions, and direct tool access.
            </p>

            <Link href="/upgrade" className="btn btn-primary">
              View Pro Membership
            </Link>
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {steps.map((step) => (
          <article
            key={`${stack.id}-${step.tool.id}`}
            className="card"
            style={{
              padding: 28,
              opacity: locked ? 0.6 : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ maxWidth: 760 }}>
                <p
                  style={{
                    margin: 0,
                    color: "#60a5fa",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  STEP {step.position}
                </p>

                <h2
                  style={{
                    margin: "8px 0 4px",
                    fontSize: 30,
                  }}
                >
                  {locked ? "Pro Workflow Step" : step.tool.name}
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#dbeafe",
                    fontWeight: 700,
                  }}
                >
                  {locked ? "Role unlocked with Pro" : step.role}
                </p>
              </div>

              {!locked ? (
                <span
                  className="glass"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                  }}
                >
                  ★ {step.tool.rating ?? "New"}
                </span>
              ) : null}
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 20,
                borderRadius: 15,
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "var(--muted)",
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                What to do
              </p>

              <p
                style={{
                  margin: "8px 0 0",
                  lineHeight: 1.75,
                  color: locked
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(255,255,255,0.82)",
                }}
              >
                {locked
                  ? "Upgrade to Pro to reveal the implementation instructions for this step."
                  : step.instructions}
              </p>
            </div>

            {!locked ? (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 20,
                }}
              >
                <Link
                  href={`/tools/${step.tool.slug}`}
                  className="btn btn-primary"
                >
                  View Tool Details
                </Link>

                {step.tool.website_url ? (
                  <a
                    href={step.tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "10px 16px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.16)",
                      color: "#ffffff",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    Visit Tool Website
                  </a>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}