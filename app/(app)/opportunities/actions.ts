"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveOpportunity(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const opportunityId = getText(formData, "opportunityId");
  const opportunitySlug = getText(formData, "opportunitySlug");

  if (!opportunityId) {
    return;
  }

  const { error } = await supabase
    .from("opportunity_progress")
    .upsert(
      {
        user_id: user.id,
        opportunity_id: opportunityId,
        status: "saved",
        last_opened_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,opportunity_id",
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error("Save opportunity error:", error.message);
    return;
  }

  revalidateOpportunityPaths(opportunitySlug);
}

export async function startOpportunity(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const opportunityId = getText(formData, "opportunityId");
  const opportunitySlug = getText(formData, "opportunitySlug");

  if (!opportunityId) {
    return;
  }

  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("opportunity_progress")
    .select("started_at, current_step")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (existingError) {
    console.error(
      "Load existing opportunity progress error:",
      existingError.message
    );
    return;
  }

  const { error } = await supabase
    .from("opportunity_progress")
    .upsert(
      {
        user_id: user.id,
        opportunity_id: opportunityId,
        status: "in_progress",
        current_step: existing?.current_step ?? 0,
        started_at: existing?.started_at ?? now,
        completed_at: null,
        last_opened_at: now,
      },
      {
        onConflict: "user_id,opportunity_id",
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error("Start opportunity error:", error.message);
    return;
  }

  revalidateOpportunityPaths(opportunitySlug);
}

export async function completeOpportunityStep(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const opportunityId = getText(formData, "opportunityId");
  const opportunitySlug = getText(
    formData,
    "opportunitySlug"
  );

  const totalSteps = Number(
    formData.get("totalSteps") ?? 0
  );

  if (
    !opportunityId ||
    !Number.isFinite(totalSteps) ||
    totalSteps <= 0
  ) {
    return;
  }

  const { data: progress, error: progressError } =
    await supabase
      .from("opportunity_progress")
      .select("current_step, status, started_at")
      .eq("user_id", user.id)
      .eq("opportunity_id", opportunityId)
      .maybeSingle();

  if (progressError) {
    console.error(
      "Load opportunity progress error:",
      progressError.message
    );
    return;
  }

  if (!progress || progress.status !== "in_progress") {
    return;
  }

  const currentStep = progress.current_step ?? 0;
  const nextStep = currentStep + 1;
  const now = new Date().toISOString();

  const isComplete = nextStep >= totalSteps;

  const { error } = await supabase
    .from("opportunity_progress")
    .update({
      current_step: isComplete ? totalSteps : nextStep,
      status: isComplete ? "completed" : "in_progress",
      completed_at: isComplete ? now : null,
      started_at: progress.started_at ?? now,
      last_opened_at: now,
    })
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId);

  if (error) {
    console.error(
      "Complete opportunity step error:",
      error.message
    );
    return;
  }

  revalidateOpportunityPaths(opportunitySlug);
}

export async function pauseOpportunity(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const opportunityId = getText(formData, "opportunityId");
  const opportunitySlug = getText(
    formData,
    "opportunitySlug"
  );

  if (!opportunityId) {
    return;
  }

  const { error } = await supabase
    .from("opportunity_progress")
    .update({
      status: "paused",
      last_opened_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .eq("status", "in_progress");

  if (error) {
    console.error("Pause opportunity error:", error.message);
    return;
  }

  revalidateOpportunityPaths(opportunitySlug);
}

export async function resumeOpportunity(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const opportunityId = getText(formData, "opportunityId");
  const opportunitySlug = getText(
    formData,
    "opportunitySlug"
  );

  if (!opportunityId) {
    return;
  }

  const { error } = await supabase
    .from("opportunity_progress")
    .update({
      status: "in_progress",
      last_opened_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .eq("status", "paused");

  if (error) {
    console.error("Resume opportunity error:", error.message);
    return;
  }

  revalidateOpportunityPaths(opportunitySlug);
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateOpportunityPaths(
  opportunitySlug: string
) {
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");

  if (opportunitySlug) {
    revalidatePath(`/opportunities/${opportunitySlug}`);
  }
}