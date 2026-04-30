import { NextRequest, NextResponse } from 'next/server'
import { listGitHubRepos, listGitHubBranches } from '@/lib/github'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<Response> {
  const token = request.headers.get('x-github-token')
  if (!token) {
    return NextResponse.json({ error: 'Missing GitHub token' }, { status: 401 })
  }

  const action = request.nextUrl.searchParams.get('action') ?? 'repos'

  try {
    if (action === 'repos') {
      const repos = await listGitHubRepos(token)
      return NextResponse.json({ repos })
    }

    if (action === 'branches') {
      const owner = request.nextUrl.searchParams.get('owner')
      const repo = request.nextUrl.searchParams.get('repo')
      if (!owner || !repo) {
        return NextResponse.json({ error: 'Missing owner/repo params' }, { status: 400 })
      }
      const branches = await listGitHubBranches(token, owner, repo)
      return NextResponse.json({ branches })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'GitHub API error' },
      { status: 500 },
    )
  }
}
