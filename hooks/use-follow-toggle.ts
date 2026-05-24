"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { followUser, unfollowUser } from "@/app/actions/follows"

interface UseFollowToggleOptions {
  initialFollowing: boolean
  /** Username for toast messages (no @ prefix). */
  username: string
}

/**
 * Optimistic follow/unfollow with toast + server-action sync.
 * Each consumer manages its own follow state but shares this mutation logic.
 */
export function useFollowToggle({ initialFollowing, username }: UseFollowToggleOptions) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  function toggle(targetUserId: string) {
    const wasFollowing = following
    setFollowing(!wasFollowing)

    startTransition(async () => {
      const result = wasFollowing
        ? await unfollowUser(targetUserId)
        : await followUser(targetUserId)

      if (!result.ok) {
        setFollowing(wasFollowing)
        toast.error(result.error)
        return
      }

      toast.success(wasFollowing ? `Unfollowed @${username}` : `Following @${username}`)
    })
  }

  return { following, isPending, toggle, setFollowing }
}
