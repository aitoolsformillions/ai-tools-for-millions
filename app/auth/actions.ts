"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const displayName = String(
    formData.get("displayName") ?? ""
  ).trim();

  const email = String(
    formData.get("email") ?? ""
  ).trim();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!displayName || !email || !password) {
    redirect(
      `/signup?error=${encodeURIComponent(
        "Please complete every field."
      )}`
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (error) {
    redirect(
      `/signup?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    "/signup?message=verification-email-sent"
  );
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = String(
    formData.get("email") ?? ""
  ).trim();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Enter your email and password."
      )}`
    );
  }

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function requestPasswordReset(
  formData: FormData
) {
  const supabase = await createClient();

  const email = String(
    formData.get("email") ?? ""
  ).trim();

  if (!email) {
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "Please enter your email address."
      )}`
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${siteUrl}/update-password`,
      }
    );

  if (error) {
    const message =
      error.message
        .toLowerCase()
        .includes("rate limit")
        ? "Too many reset emails were requested. Please wait before requesting another."
        : error.message;

    redirect(
      `/forgot-password?error=${encodeURIComponent(
        message
      )}`
    );
  }

  redirect(
    "/forgot-password?message=reset-email-sent"
  );
}

export async function updatePassword(
  formData: FormData
) {
  const supabase = await createClient();

  const password = String(
    formData.get("password") ?? ""
  );

  const confirmPassword = String(
    formData.get("confirmPassword") ?? ""
  );

  if (!password || !confirmPassword) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "Please complete both password fields."
      )}`
    );
  }

  if (password.length < 8) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "Your password must contain at least 8 characters."
      )}`
    );
  }

  if (password !== confirmPassword) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "The passwords do not match."
      )}`
    );
  }

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    const message =
      error.message
        .toLowerCase()
        .includes("rate limit")
        ? "Too many requests were made. Please wait and try again."
        : error.message;

    redirect(
      `/update-password?error=${encodeURIComponent(
        message
      )}`
    );
  }

  redirect(
    "/login?message=Password updated successfully. Please sign in."
  );
}