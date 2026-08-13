"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_OUTCOME_TYPES = [
  "money_earned",
  "time_saved",
  "leads_generated",
  "tasks_automated",
  "skill_gained",
  "other",
];

const VALID_SOURCE_TYPES = [
  "opportunity",
  "learning_path",
  "stack",
  "tool",
];

export async function recordMemberOutcome(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sourceType = getText(formData, "sourceType");
  const sourceId = getText(formData, "sourceId");
  const sourceSlug = getText(formData, "sourceSlug");
  const outcomeType = getText(formData, "outcomeType");
  const unit = getText(formData, "unit");
  const summary = getText(formData, "summary");
  const notes = getText(formData, "notes");

  const rawNumericValue = getText(
    formData,
    "numericValue"
  );

  const numericValue =
    rawNumericValue === ""
      ? null
      : Number(rawNumericValue);

  if (
    !VALID_SOURCE_TYPES.includes(sourceType) ||
    !VALID_OUTCOME_TYPES.includes(outcomeType) ||
    !sourceId ||
    !summary
  ) {
    return;
  }

  if (
    numericValue !== null &&
    !Number.isFinite(numericValue)
  ) {
    return;
  }

  const { error } = await supabase
    .from("member_outcomes")
    .insert({
      user_id: user.id,
      source_type: sourceType,
      source_id: sourceId,
      outcome_type: outcomeType,
      numeric_value: numericValue,
      unit: unit || null,
      summary,
      notes: notes || null,
    });

  if (error) {
    console.error(
      "Record member outcome error:",
      error.message
    );
    return;
  }

  revalidatePath("/dashboard");

  if (
    sourceType === "opportunity" &&
    sourceSlug
  ) {
    revalidatePath(
      `/opportunities/${sourceSlug}`
    );
  }

  if (
    sourceType === "learning_path" &&
    sourceSlug
  ) {
    revalidatePath(
      `/learn/${sourceSlug}`
    );
  }
}

function getText(
  formData: FormData,
  key: string
) {
  return String(
    formData.get(key) ?? ""
  ).trim();
}