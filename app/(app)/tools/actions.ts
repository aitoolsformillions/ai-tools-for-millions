"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addToolFavorite(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const toolId = getText(
    formData,
    "toolId"
  );

  const toolSlug = getText(
    formData,
    "toolSlug"
  );

  if (!toolId) {
    return;
  }

  const { error } = await supabase
    .from("favorites")
    .upsert(
      {
        user_id: user.id,
        tool_id: toolId,
      },
      {
        onConflict: "user_id,tool_id",
        ignoreDuplicates: true,
      }
    );

  if (error) {
    console.error(
      "Add favorite error:",
      error.message
    );

    return;
  }

  revalidateFavoritePaths(toolSlug);
}

export async function removeToolFavorite(
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const toolId = getText(
    formData,
    "toolId"
  );

  const toolSlug = getText(
    formData,
    "toolSlug"
  );

  if (!toolId) {
    return;
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("tool_id", toolId);

  if (error) {
    console.error(
      "Remove favorite error:",
      error.message
    );

    return;
  }

  revalidateFavoritePaths(toolSlug);
}

function getText(
  formData: FormData,
  key: string
) {
  return String(
    formData.get(key) ?? ""
  ).trim();
}

function revalidateFavoritePaths(
  slug: string
) {
  revalidatePath("/favorites");
  revalidatePath("/tools");

  if (slug) {
    revalidatePath(
      `/tools/${slug}`
    );
  }
}