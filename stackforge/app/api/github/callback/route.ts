import { NextRequest, NextResponse } from 'next/server'
import { exchangeGitHubCode } from '@/lib/github'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<Response> {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/build?error=${encodeURIComponent(error)}`, request.url),
    )
  }
  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 })
  }

  try {
    const token = await exchangeGitHubCode(code)
    // Redirect back to builder with token in query param (stored client-side in sessionStorage)
    const redirectUrl = new URL('/build', request.url)
    redirectUrl.searchParams.set('gh_token', token)
    redirectUrl.searchParams.set('gh_connected', '1')
    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OAuth failed'
    return NextResponse.redirect(
      new URL(`/build?error=${encodeURIComponent(msg)}`, request.url),
    )
  }
}
