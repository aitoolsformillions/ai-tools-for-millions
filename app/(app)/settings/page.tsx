import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
          SETTINGS
        </span>

        <h1
          style={{
            fontSize: 48,
            letterSpacing: "-.04em",
            margin: "12px 0",
          }}
        >
          Account Settings
        </h1>

        <p
          style={{
            color: "var(--muted)",
            fontSize: 18,
          }}
        >
          Manage your password and account preferences.
        </p>
      </div>

      <div
        className="card"
        style={{
          maxWidth: 720,
          padding: 30,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Security</h2>

        <p
          style={{
            color: "var(--muted)",
            lineHeight: 1.7,
          }}
        >
          Update your password if you want to change the credentials used to
          sign in to your account.
        </p>

        <Link
          href="/forgot-password"
          className="btn btn-primary"
          style={{ display: "inline-flex", marginTop: 12 }}
        >
          Change Password
        </Link>
      </div>
    </section>
  );
}