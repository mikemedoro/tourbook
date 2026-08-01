"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from "@/components/follows/follow-button"
import { createClient } from "@/lib/supabase/client"
import { userAvatarGradient, getInitials } from "@/lib/utils"

interface UserResult {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

interface UserSearchProps {
  currentUserId: string
}

export function UserSearch({ currentUserId }: UserSearchProps) {
  const supabase = createClient()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserResult[]>([])
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [searched, setSearched] = useState(false)

  // Load existing follows on mount
  useEffect(() => {
    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId)
      .then(({ data }) => {
        if (data) setFollowing(new Set((data as { following_id: string }[]).map((r) => r.following_id)))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setSearched(false)
      return
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .or(`username.ilike.%${trimmed}%`)
      .eq("is_public", true)
      .neq("id", currentUserId)
      .limit(20)

    setResults((data as UserResult[]) ?? [])
    setSearched(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  // FollowButton owns the mutation and its own optimistic state; this set only
  // seeds each row and is kept current so re-running a search stays accurate.
  function syncFollowing(userId: string, isFollowing: boolean) {
    setFollowing((prev) => {
      const next = new Set(prev)
      if (isFollowing) next.add(userId)
      else next.delete(userId)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by username…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {searched && results.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-6">No users found.</p>
      )}

      {results.length > 0 && (
        <div className="flex flex-col divide-y">
          {results.map((user) => {
            const initials = getInitials(user.display_name, user.username)
            const isFollowing = following.has(user.id)
            return (
              <div key={user.id} className="flex items-center gap-3 py-3">
                <Link href={`/profile/${user.username}`}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback style={userAvatarGradient(user.username)}>{initials}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${user.username}`} className="hover:underline">
                    <p className="font-semibold text-sm">@{user.username}</p>
                  </Link>
                  {user.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{user.bio}</p>
                  )}
                </div>
                <FollowButton
                  targetUserId={user.id}
                  username={user.username}
                  initialFollowing={isFollowing}
                  onChange={(next) => syncFollowing(user.id, next)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
