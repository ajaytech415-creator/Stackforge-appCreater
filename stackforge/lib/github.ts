import type { GitHubRepo, GitHubBranch } from '@/types'

const GITHUB_API = 'https://api.github.com'

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export async function getGitHubUser(token: string) {
  const res = await fetch(`${GITHUB_API}/user`, { headers: githubHeaders(token) })
  if (!res.ok) throw new Error('Failed to fetch GitHub user')
  const data = await res.json() as { login: string; name: string; avatar_url: string }
  return data
}

export async function listGitHubRepos(token: string): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API}/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator`,
    { headers: githubHeaders(token) },
  )
  if (!res.ok) throw new Error('Failed to fetch repositories')
  const data = await res.json() as Array<{
    id: number; name: string; full_name: string; description: string | null
    private: boolean; default_branch: string; html_url: string
    updated_at: string; language: string | null
  }>
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    isPrivate: r.private,
    defaultBranch: r.default_branch,
    url: r.html_url,
    updatedAt: r.updated_at,
    language: r.language,
  }))
}

export async function listGitHubBranches(
  token: string,
  owner: string,
  repo: string,
): Promise<GitHubBranch[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/branches?per_page=50`,
    { headers: githubHeaders(token) },
  )
  if (!res.ok) throw new Error('Failed to fetch branches')
  const data = await res.json() as Array<{ name: string }>
  // Default branch first
  return data.map((b) => ({ name: b.name, isDefault: false }))
}

export function getGitHubOAuthUrl(): string {
  const clientId = process.env.GITHUB_CLIENT_ID ?? ''
  const redirectUri = encodeURIComponent(
    (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000') + '/api/github/callback',
  )
  const scope = encodeURIComponent('repo,read:user')
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
}

export async function exchangeGitHubCode(code: string): Promise<string> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(data.error ?? 'GitHub OAuth failed')
  return data.access_token
}
