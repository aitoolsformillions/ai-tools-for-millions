"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_RECOMMENDATION_TYPES = [
  "opportunity",
  "learning_path",
  "stack",
  "tool",
];

const VALID_EVENT_TYPES = [
  "shown",
  "opened",
  "saved",
  "started",
  "completed",
  "dismissed",
];

export async function recordRecommendationEvent(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recommendationType = getText(
    formData,
    "recommendationType"
  );

  const recommendationId = getText(
    formData,
    "recommendationId"
  );

  const eventType = getText(
    formData,
    "eventType"
  );

  const context = getText(
    formData,
    "context"
  );

  const destination = getText(
    formData,
    "destination"
  );

  if (
    !VALID_RECOMMENDATION_TYPES.includes(
      recommendationType
    ) ||
    !VALID_EVENT_TYPES.includes(eventType) ||
    !recommendationId
  ) {
    return;
  }

  const { error } = await supabase
    .from("recommendation_events")
    .insert({
      user_id: user.id,
      recommendation_type: recommendationType,
      recommendation_id: recommendationId,
      event_type: eventType,
      context: context || null,
    });

  if (error) {
    console.error(
      "Record recommendation event error:",
      error.message
    );

    return;
  }

  revalidatePath("/dashboard");

  if (destination) {
    redirect(destination);
  }
}

export async function dismissRecommendation(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recommendationType = getText(
    formData,
    "recommendationType"
  );

  const recommendationId = getText(
    formData,
    "recommendationId"
  );

  const context = getText(
    formData,
    "context"
  );

  if (
    !VALID_RECOMMENDATION_TYPES.includes(
      recommendationType
    ) ||
    !recommendationId
  ) {
    return;
  }

  const { error } = await supabase
    .from("recommendation_events")
    .insert({
      user_id: user.id,
      recommendation_type: recommendationType,
      recommendation_id: recommendationId,
      event_type: "dismissed",
      context: context || null,
    });

  if (error) {
    console.error(
      "Dismiss recommendation error:",
      error.message
    );

    return;
  }

  revalidatePath("/dashboard");
}

function getText(
  formData: FormData,
  key: string
) {
  return String(
    formData.get(key) ?? ""
  ).trim();
}