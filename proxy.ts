import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ---------------------------------------------------------------------------
// In-memory rate limiter
// Resets on cold start; doesn't share state across Vercel instances.
// Fine for beta / low-traffic. Swap store for @upstash/ratelimit when needed.
// ---------------------------------------------------------------------------

interface RateEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateEntry>()

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/geocode': { max: 30, windowMs: 60_000 }, // 30 req/min — protects Nominatim
  '/login':       { max: 10, windowMs: 60_000 }, // 10 req/min — brute-force guard
  '/register':    { max: 5,  windowMs: 60_000 }, // 5 req/min
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

function isRateLimited(ip: string, pathname: string): boolean {
  const limit = LIMITS[pathname]
  if (!limit) return false

  const key = `${ip}:${pathname}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + limit.windowMs })
    return false
  }

  if (entry.count >= limit.max) return true

  entry.count++
  return false
}

// ---------------------------------------------------------------------------

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname in LIMITS) {
    const ip = getIp(request)
    if (isRateLimited(ip, pathname)) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
