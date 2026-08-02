"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { Ticket, TicketBody } from "@/components/ui/ticket"
import { FollowButton } from "@/components/follows/follow-button"
import { UserRow } from "@/components/users/user-row"
import { createClient } from "@/lib/supabase/client"

interface UserResult {
  id: string
  username: string
  display_name: string | null
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
      .select("id, username, display_name, bio")
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
        <EmptyState
          title="No users found"
          description="Try a different username, or check the spelling."
        />
      )}

      {results.length > 0 && (
        <Ticket perforated={false}>
          <TicketBody className="gap-0 p-0">
            <div className="divide-y">
              {results.map((user) => (
                <UserRow
                  key={user.id}
                  username={user.username}
                  displayName={user.display_name}
                  primary={
                    <Link href={`/profile/${user.username}`} className="hover:underline">
                      @{user.username}
                    </Link>
                  }
                  secondary={user.bio}
                  action={
                    <FollowButton
                      targetUserId={user.id}
                      username={user.username}
                      initialFollowing={following.has(user.id)}
                      onChange={(next) => syncFollowing(user.id, next)}
                    />
                  }
                />
              ))}
            </div>
          </TicketBody>
        </Ticket>
      )}
    </div>
  )
}
