"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type ActionResult = { ok: true } | { ok: false; error: string }

async function getUserOrFail() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null as null }
  return { supabase, user }
}

export async function followUser(targetUserId: string): Promise<ActionResult> {
  const { supabase, user } = await getUserOrFail()
  if (!user) return { ok: false, error: "Not signed in" }
  if (user.id === targetUserId) return { ok: false, error: "Cannot follow yourself" }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetUserId })

  if (error) return { ok: false, error: error.message }

  revalidatePath("/notifications")
  return { ok: true }
}

export async function unfollowUser(targetUserId: string): Promise<ActionResult> {
  const { supabase, user } = await getUserOrFail()
  if (!user) return { ok: false, error: "Not signed in" }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)

  if (error) return { ok: false, error: error.message }

  return { ok: true }
}
