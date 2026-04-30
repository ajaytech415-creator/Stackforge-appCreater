import { NextResponse } from 'next/server'
import { getGitHubOAuthUrl } from '@/lib/github'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  if (!process.env.GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: 'GitHub OAuth not configured. Add GITHUB_CLIENT_ID to .env' },
      { status: 501 },
    )
  }
  const url = getGitHubOAuthUrl()
  return NextResponse.redirect(url)
}
