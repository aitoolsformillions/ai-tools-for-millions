"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(
    "Verifying your password-reset session..."
  );
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setReady(true);
        setMessage("");
      } else {
        setMessage(
          "No valid recovery session was found. Request a new password-reset email and open only the newest link."
        );
      }
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setMessage("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    await supabase.auth.signOut();

    router.replace(
      "/login?message=Password updated successfully. Please sign in."
    );
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-950 p-8"
      >
        <div>
          <p className="mb-2 text-sm font-semibold text-blue-400">
            AI Tools for Millions
          </p>

          <h1 className="text-3xl font-bold">Create New Password</h1>

          <p className="mt-2 text-sm text-gray-400">
            Enter and confirm your new account password.
          </p>
        </div>

        {message ? (
          <p className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-200">
            {message}
          </p>
        ) : null}

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="New Password"
          minLength={8}
          required
          disabled={!ready || submitting}
          autoComplete="new-password"
          className="rounded-xl border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500 disabled:opacity-50"
        />

        <input
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          type="password"
          placeholder="Confirm New Password"
          minLength={8}
          required
          disabled={!ready || submitting}
          autoComplete="new-password"
          className="rounded-xl border border-gray-700 bg-gray-900 p-3 outline-none focus:border-blue-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!ready || submitting}
          className="rounded-xl bg-blue-600 p-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Updating Password..." : "Update Password"}
        </button>

        <Link
          href="/forgot-password"
          className="text-center text-sm text-gray-400 hover:text-white"
        >
          Request another reset link
        </Link>
      </form>
    </main>
  );
}