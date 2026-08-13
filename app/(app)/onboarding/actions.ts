"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_GOALS = [
  "Make Money",
  "Save Time",
  "Learn AI",
  "Find Market Gaps",
];

const VALID_EXPERIENCE = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const VALID_INTERESTS = [
  "Local Services",
  "Real Estate",
  "Content",
  "Ecommerce",
  "Consulting",
  "Professional Services",
  "Other",
];

const VALID_TIME = [
  "Under 2 hours",
  "2-5 hours",
  "5+ hours",
];

const VALID_BUDGET = [
  "$0-$100",
  "$100-$500",
  "$500+",
];

export async function saveMemberPreferences(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const primaryGoal = String(
    formData.get("primaryGoal") ?? ""
  );

  const experienceLevel = String(
    formData.get("experienceLevel") ?? ""
  );

  const businessInterest = String(
    formData.get("businessInterest") ?? ""
  );

  const weeklyTime = String(
    formData.get("weeklyTime") ?? ""
  );

  const monthlyBudget = String(
    formData.get("monthlyBudget") ?? ""
  );

  if (
    !VALID_GOALS.includes(primaryGoal) ||
    !VALID_EXPERIENCE.includes(experienceLevel) ||
    !VALID_INTERESTS.includes(businessInterest) ||
    !VALID_TIME.includes(weeklyTime) ||
    !VALID_BUDGET.includes(monthlyBudget)
  ) {
    throw new Error(
      "One or more preference values are invalid."
    );
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("member_preferences")
    .upsert(
      {
        user_id: user.id,
        primary_goal: primaryGoal,
        experience_level: experienceLevel,
        business_interest: businessInterest,
        weekly_time: weeklyTime,
        monthly_budget: monthlyBudget,
        onboarding_complete: true,
        updated_at: now,
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error(
      "Save member preferences error:",
      error.message
    );

    throw new Error(
      "Unable to save your preferences."
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  revalidatePath("/settings");

  redirect("/dashboard?onboarding=complete");
}