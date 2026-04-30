'use client'
import { useEffect, useRef } from 'react'
import type { BuildLogEntry, BuildStatus, BuilderState } from '@/types'

interface Props {
  status: BuildStatus
  logs: BuildLogEntry[]
  outputs: BuilderState['buildOutputs']
  error: string | null
  appName: string
}

function StatusBadge({ status }: { status: BuildStatus }) {
  const map: Record<BuildStatus, { label: string; cls: string }> = {
    idle:      { label: 'Idle',       cls: 'bg-white/10 text-white/50' },
    uploading: { label: 'Uploading',  cls: 'bg-blue-500/20 text-blue-300' },
    extracting:{ label: 'Extracting', cls: 'bg-yellow-500/20 text-yellow-300' },
    injecting: { label: 'Injecting',  cls: 'bg-purple-500/20 text-purple-300' },
    packaging: { label: 'Packaging',  cls: 'bg-orange-500/20 text-orange-300' },
    done:      { label: 'Done ✓',    cls: 'bg-green-500/20 text-green-300' },
    error:     { label: 'Failed',     cls: 'bg-red-500/20 text-red-300' },
  }
  const { label, cls } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {status !== 'done' && status !== 'idle' && status !== 'error' && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  )
}

const STAGES: Array<{ key: BuildStatus; label: string; icon: string }> = [
  { key: 'uploading',  label: 'Upload',   icon: '📤' },
  { key: 'extracting', label: 'Extract',  icon: '📦' },
  { key: 'injecting',  label: 'Inject',   icon: '⚡' },
  { key: 'packaging',  label: 'Package',  icon: '🔨' },
  { key: 'done',       label: 'Ready',    icon: '✅' },
]

const STAGE_ORDER: BuildStatus[] = ['uploading','extracting','injecting','packaging','done']

function ProgressBar({ status }: { status: BuildStatus }) {
  const idx = STAGE_ORDER.indexOf(status)
  const pct = status === 'done' ? 100 : status === 'error' ? 100 : Math.max(0, (idx / (STAGE_ORDER.length - 1)) * 100)
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-white/40">
        <span>Building desktop app…</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${status === 'error' ? 'bg-red-500' : status === 'done' ? 'bg-green-500' : 'bg-brand'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between">
        {STAGES.map((s, i) => {
          const done = STAGE_ORDER.indexOf(status) > i || status === 'done'
          const active = s.key === status
          return (
            <div key={s.key} className={`flex flex-col items-center gap-1 text-[10px] transition-all ${done ? 'text-green-400' : active ? 'text-brand-light' : 'text-white/20'}`}>
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LogLine({ log }: { log: BuildLogEntry }) {
  const colors: Record<BuildLogEntry['level'], string> = {
    info:    'text-white/60',
    warn:    'text-yellow-400',
    error:   'text-red-400',
    success: 'text-green-400',
  }
  const time = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })
  return (
    <div className={`flex gap-2 font-mono text-xs leading-relaxed ${colors[log.level]}`}>
      <span className="shrink-0 text-white/20">{time}</span>
      <span>{log.message}</span>
    </div>
  )
}

export function BuildProgress({ status, logs, outputs, error, appName }: Props) {
  const logEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs.length])

  const isRunning = !['idle','done','error'].includes(status)

  return (
    <div className="space-y-5">
      {/* Status header */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Building <span className="text-brand-light">{appName || 'your app'}</span></h3>
            <p className="text-xs text-white/40 mt-0.5">electron-builder is packaging your project</p>
          </div>
          <StatusBadge status={status} />
        </div>
        {isRunning || status === 'done' || status === 'error' ? (
          <ProgressBar status={status} />
        ) : null}
      </div>

      {/* Build log */}
      {logs.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 bg-white/[0.02]">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">Build Log</span>
            {isRunning && <span className="flex items-center gap-1.5 text-xs text-brand-light"><span className="h-1.5 w-1.5 rounded-full bg-brand-light animate-pulse"/>Live</span>}
          </div>
          <div className="max-h-72 overflow-y-auto p-4 space-y-1">
            {logs.map((l, i) => <LogLine key={i} log={l} />)}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-5">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <div>
              <p className="text-sm font-semibold text-red-300">Build failed</p>
              <p className="text-xs text-red-400/80 mt-1 leading-relaxed font-mono">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Download */}
      {status === 'done' && outputs.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Download Your App</p>
          {outputs.map((o) => (
            <a
              key={o.downloadUrl}
              href={o.downloadUrl}
              download={o.filename}
              className="flex items-center gap-4 rounded-xl border border-green-500/20 bg-green-500/5 px-5 py-4 text-white no-underline transition-all hover:border-green-500/40 hover:bg-green-500/10 hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{o.filename}</p>
                <p className="text-xs text-white/40">{o.sizeBytes ? `${(o.sizeBytes / 1024 / 1024).toFixed(1)} MB` : 'Ready to download'}</p>
              </div>
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300 shrink-0">Download</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
