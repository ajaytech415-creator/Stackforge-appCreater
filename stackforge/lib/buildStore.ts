import type { BuildLogEntry } from '@/types'

export interface BuildEntry {
  status: 'running' | 'done' | 'error'
  logs: BuildLogEntry[]
  outputs: string[]
  error?: string
}

// In-memory store for build status (per buildId)
// Shared between /api/build and /api/build/status routes
export const buildStore = new Map<string, BuildEntry>()
