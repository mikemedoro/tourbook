"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { userAvatarGradient } from "@/lib/utils"

interface UserResult {
  id: string
  username: string
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
  const [loadingId, setLoadingId] = useState<string | null>(null)
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
      .select("id, username, avatar_url, bio")
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

  async function toggleFollow(userId: string, username: string) {
    setLoadingId(userId)
    const isFollowing = following.has(userId)

    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
      if (!error) {
        setFollowing((prev) => { const next = new Set(prev); next.delete(userId); return next })
        toast.success(`Unfollowed @${username}`)
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: userId })
      if (!error) {
        setFollowing((prev) => new Set(prev).add(userId))
        toast.success(`Following @${username}`)
      }
    }
    setLoadingId(null)
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
            const initials = user.username.slice(0, 2).toUpperCase()
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
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  disabled={loadingId === user.id}
                  onClick={() => toggleFollow(user.id, user.username)}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
