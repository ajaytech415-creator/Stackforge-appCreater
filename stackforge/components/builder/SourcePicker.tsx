'use client'
import { useRef, useState } from 'react'
import type { GitHubRepo } from '@/types'

interface Props {
  sourceType: 'zip' | 'github'
  zipFile: File | null
  githubRepo: GitHubRepo | null
  githubBranch: string
  onSourceTypeChange: (t: 'zip' | 'github') => void
  onZipSelect: (f: File) => void
  onRepoSelect: (r: GitHubRepo) => void
  onBranchChange: (b: string) => void
}

export function SourcePicker({
  sourceType, zipFile, githubRepo, githubBranch,
  onSourceTypeChange, onZipSelect, onRepoSelect, onBranchChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [branches, setBranches] = useState<string[]>([])
  const [githubToken, setGithubToken] = useState('')
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repoError, setRepoError] = useState('')

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.zip')) onZipSelect(file)
  }

  const fetchRepos = async () => {
    if (!githubToken) { setRepoError('Enter your GitHub Personal Access Token'); return }
    setLoadingRepos(true); setRepoError('')
    try {
      const res = await fetch('/api/github/repos?action=repos', { headers: { 'x-github-token': githubToken } })
      const data = await res.json() as { repos?: GitHubRepo[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to load repos')
      setRepos(data.repos ?? [])
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : 'Error loading repos')
    } finally { setLoadingRepos(false) }
  }

  const fetchBranches = async (repo: GitHubRepo) => {
    onRepoSelect(repo)
    const [owner, name] = repo.fullName.split('/')
    const res = await fetch(`/api/github/repos?action=branches&owner=${owner}&repo=${name}`, { headers: { 'x-github-token': githubToken } })
    const data = await res.json() as { branches?: Array<{ name: string }> }
    setBranches((data.branches ?? []).map((b) => b.name))
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-3">
        {(['zip', 'github'] as const).map((t) => (
          <button key={t} type="button" onClick={() => onSourceTypeChange(t)}
            className={`flex items-center justify-center gap-2.5 rounded-xl border py-4 text-sm font-medium transition-all duration-200 ${
              sourceType === t ? 'border-brand/40 bg-brand/10 text-white shadow-md shadow-brand/10'
              : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:text-white/80'}`}>
            {t === 'zip' ? (
              <><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Upload ZIP</>
            ) : (
              <><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              Connect GitHub</>
            )}
          </button>
        ))}
      </div>

      {sourceType === 'zip' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-14 text-center transition-all duration-200 ${
            dragging ? 'border-brand bg-brand/10 scale-[1.01]'
            : zipFile ? 'border-green-500/40 bg-green-500/5'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
        >
          <input ref={inputRef} type="file" accept=".zip" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onZipSelect(f) }} />
          {zipFile ? (
            <div className="space-y-2">
              <svg className="mx-auto h-10 w-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>
              <p className="text-lg font-semibold text-white">{zipFile.name}</p>
              <p className="text-sm text-white/40">{(zipFile.size / 1024).toFixed(0)} KB · click to change</p>
            </div>
          ) : (
            <div className="space-y-3">
              <svg className="mx-auto h-12 w-12 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-base font-medium text-white/70">Drop your web project ZIP here</p>
              <p className="text-sm text-white/40">or click to browse · max 100 MB</p>
              <p className="text-xs text-white/25">ZIP must contain an <code className="text-brand-light">index.html</code> entry point</p>
            </div>
          )}
        </div>
      )}

      {sourceType === 'github' && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-5 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40">GitHub Personal Access Token</label>
            <div className="flex gap-2">
              <input type="password" className="input flex-1" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
              <button type="button" onClick={fetchRepos} disabled={loadingRepos} className="btn btn-primary shrink-0 px-5">
                {loadingRepos ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Load Repos'}
              </button>
            </div>
            <p className="text-xs text-white/30">GitHub → Settings → Developer settings → Personal access tokens → repo scope</p>
            {repoError && <p className="text-xs text-red-400">{repoError}</p>}
          </div>

          {repos.length > 0 && (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] text-xs font-semibold uppercase tracking-widest text-white/40">{repos.length} Repositories</div>
              <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
                {repos.map((r) => (
                  <button key={r.id} type="button" onClick={() => fetchBranches(r)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${githubRepo?.id === r.id ? 'bg-brand/10 border-l-2 border-brand' : 'hover:bg-white/[0.03] border-l-2 border-transparent'}`}>
                    <svg className="h-4 w-4 shrink-0 text-white/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.name}</p>
                      {r.description && <p className="text-xs text-white/40 truncate">{r.description}</p>}
                    </div>
                    {r.language && <span className="text-xs text-white/30 shrink-0">{r.language}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {githubRepo && branches.length > 0 && (
            <div className="glass-card rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Branch</label>
              <select className="input" value={githubBranch} onChange={(e) => onBranchChange(e.target.value)}>
                {branches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
