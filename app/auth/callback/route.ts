import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const nextParam = searchParams.get("next")
  // Only allow relative paths beginning with a single "/" to prevent open redirects.
  const next =
    nextParam && /^\/(?!\/)/.test(nextParam) ? nextParam : "/feed"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if this user has an auto-generated username (OAuth signup without username choice)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()

        // Auto-generated usernames end with _[8 hex chars] from the UUID
        if (profile?.username && /_[0-9a-f]{8}$/i.test(profile.username)) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
