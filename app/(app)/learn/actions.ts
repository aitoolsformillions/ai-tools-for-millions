"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startLearningPath(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learningPathId = getText(formData, "learningPathId");
  const learningPathSlug = getText(formData, "learningPathSlug");

  if (!learningPathId) {
    return;
  }

  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("member_learning_progress")
    .select("started_at, current_module")
    .eq("user_id", user.id)
    .eq("learning_path_id", learningPathId)
    .maybeSingle();

  if (existingError) {
    console.error(
      "Load learning progress error:",
      existingError.message
    );
    return;
  }

  const { error } = await supabase
    .from("member_learning_progress")
    .upsert(
      {
        user_id: user.id,
        learning_path_id: learningPathId,
        status: "in_progress",
        current_module: existing?.current_module ?? 0,
        started_at: existing?.started_at ?? now,
        completed_at: null,
        last_opened_at: now,
      },
      {
        onConflict: "user_id,learning_path_id",
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error(
      "Start learning path error:",
      error.message
    );
    return;
  }

  revalidateLearningPaths(learningPathSlug);
}

export async function completeLearningModule(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learningPathId = getText(formData, "learningPathId");
  const learningPathSlug = getText(
    formData,
    "learningPathSlug"
  );

  const totalModules = Number(
    formData.get("totalModules") ?? 0
  );

  if (
    !learningPathId ||
    !Number.isFinite(totalModules) ||
    totalModules <= 0
  ) {
    return;
  }

  const { data: progress, error: progressError } =
    await supabase
      .from("member_learning_progress")
      .select("current_module, status, started_at")
      .eq("user_id", user.id)
      .eq("learning_path_id", learningPathId)
      .maybeSingle();

  if (progressError) {
    console.error(
      "Load learning progress error:",
      progressError.message
    );
    return;
  }

  if (!progress || progress.status !== "in_progress") {
    return;
  }

  const currentModule = progress.current_module ?? 0;
  const nextModule = currentModule + 1;
  const isComplete = nextModule >= totalModules;
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("member_learning_progress")
    .update({
      current_module: isComplete
        ? totalModules
        : nextModule,
      status: isComplete ? "completed" : "in_progress",
      started_at: progress.started_at ?? now,
      completed_at: isComplete ? now : null,
      last_opened_at: now,
    })
    .eq("user_id", user.id)
    .eq("learning_path_id", learningPathId);

  if (error) {
    console.error(
      "Complete learning module error:",
      error.message
    );
    return;
  }

  revalidateLearningPaths(learningPathSlug);
}

export async function pauseLearningPath(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learningPathId = getText(formData, "learningPathId");
  const learningPathSlug = getText(
    formData,
    "learningPathSlug"
  );

  if (!learningPathId) {
    return;
  }

  const { error } = await supabase
    .from("member_learning_progress")
    .update({
      status: "paused",
      last_opened_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("learning_path_id", learningPathId)
    .eq("status", "in_progress");

  if (error) {
    console.error(
      "Pause learning path error:",
      error.message
    );
    return;
  }

  revalidateLearningPaths(learningPathSlug);
}

export async function resumeLearningPath(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const learningPathId = getText(formData, "learningPathId");
  const learningPathSlug = getText(
    formData,
    "learningPathSlug"
  );

  if (!learningPathId) {
    return;
  }

  const { error } = await supabase
    .from("member_learning_progress")
    .update({
      status: "in_progress",
      last_opened_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("learning_path_id", learningPathId)
    .eq("status", "paused");

  if (error) {
    console.error(
      "Resume learning path error:",
      error.message
    );
    return;
  }

  revalidateLearningPaths(learningPathSlug);
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateLearningPaths(slug: string) {
  revalidatePath("/learn");
  revalidatePath("/dashboard");

  if (slug) {
    revalidatePath(`/learn/${slug}`);
  }
}