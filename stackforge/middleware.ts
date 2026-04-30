import { NextResponse, type NextRequest } from 'next/server'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 10
const buckets = new Map<string, { count: number; resetAt: number }>()

export function middleware(req: NextRequest) {
  if (req.method !== 'POST' || !req.nextUrl.pathname.startsWith('/api/generate')) {
    return NextResponse.next()
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }
  bucket.count++
  if (bucket.count > MAX_REQUESTS) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in 60s.' }, { status: 429 })
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/generate' }
