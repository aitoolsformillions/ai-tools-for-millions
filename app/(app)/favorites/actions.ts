"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const toolId = String(formData.get("toolId") ?? "").trim();

  if (!toolId) {
    throw new Error("Missing tool ID.");
  }

  const { data: existingFavorite, error: lookupError } = await supabase
    .from("favorites")
    .select("user_id, tool_id")
    .eq("user_id", user.id)
    .eq("tool_id", toolId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Favorite lookup failed: ${lookupError.message}`);
  }

  if (existingFavorite) {
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("tool_id", toolId);

    if (deleteError) {
      throw new Error(`Favorite delete failed: ${deleteError.message}`);
    }
  } else {
    const { error: insertError } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        tool_id: toolId,
      });

    if (insertError) {
      throw new Error(`Favorite save failed: ${insertError.message}`);
    }
  }

  revalidatePath("/tools");
  revalidatePath("/favorites");
}