import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, created_at, updated_at, membership_tier, subscription_status"
    )
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    "AI Tools Member";

  return (
    <section>
      <div style={{ marginBottom: 30 }}>
        <span
          style={{
            color: "var(--blue-2)",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          ACCOUNT
        </span>

        <h1
          style={{
            fontSize: 48,
            letterSpacing: "-.04em",
            margin: "12px 0",
          }}
        >
          Your Profile
        </h1>

        <p
          style={{
            color: "var(--muted)",
            fontSize: 18,
          }}
        >
          Manage your account information and membership details.
        </p>
      </div>

      <div
        className="card"
        style={{
          maxWidth: 720,
          padding: 30,
        }}
      >
        {/* DISPLAY NAME */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Display Name
          </p>

          <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>
            {displayName}
          </h2>
        </div>

        {/* MEMBERSHIP */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Membership
          </p>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {profile?.membership_tier === "pro"
              ? "Pro Member"
              : "Free Member"}
          </p>

          <p
            style={{
              margin: "6px 0 0",
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            Subscription status:{" "}
            {profile?.subscription_status ?? "inactive"}
          </p>
        </div>

        {/* EMAIL */}
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Email
          </p>

          <p style={{ margin: "6px 0 0", fontSize: 18 }}>
            {user.email}
          </p>
        </div>

        {/* MEMBER SINCE */}
        <div>
          <p
            style={{
              margin: 0,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Member Since
          </p>

          <p style={{ margin: "6px 0 0", fontSize: 18 }}>
            {new Date(
              profile?.created_at ?? user.created_at
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
    </section>
  );
}