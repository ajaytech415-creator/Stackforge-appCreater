'use client'
import { useCallback, useReducer } from 'react'
import type {
  BuilderState, AppConfig, WindowConfig, AppFeatures, TargetConfig, GitHubRepo, BuildLogEntry,
} from '@/types'
import { defaultBuilderState, slugifyAppId } from '@/types'

type Action =
  | { type: 'SET_STEP'; step: BuilderState['step'] }
  | { type: 'SET_SOURCE_TYPE'; sourceType: BuilderState['sourceType'] }
  | { type: 'SET_ZIP_FILE'; file: File | null }
  | { type: 'SET_GITHUB_REPO'; repo: GitHubRepo }
  | { type: 'SET_GITHUB_BRANCH'; branch: string }
  | { type: 'SET_GITHUB_TOKEN'; token: string }
  | { type: 'UPDATE_APP'; patch: Partial<AppConfig> }
  | { type: 'UPDATE_WINDOW'; patch: Partial<WindowConfig> }
  | { type: 'UPDATE_FEATURES'; patch: Partial<AppFeatures> }
  | { type: 'UPDATE_TARGETS'; patch: Partial<TargetConfig> }
  | { type: 'SET_LOGO'; file: File; preview: string }
  | { type: 'CLEAR_LOGO' }
  | { type: 'BUILD_START'; buildId: string }
  | { type: 'BUILD_LOG'; log: BuildLogEntry }
  | { type: 'BUILD_DONE'; outputs: Array<{ filename: string; downloadUrl: string; sizeBytes: number }> }
  | { type: 'BUILD_ERROR'; error: string }
  | { type: 'RESET' }

interface StateExt extends BuilderState {
  githubToken: string
}

function reducer(state: StateExt, action: Action): StateExt {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_SOURCE_TYPE': return { ...state, sourceType: action.sourceType }
    case 'SET_ZIP_FILE': return { ...state, zipFile: action.file }
    case 'SET_GITHUB_REPO':
      return { ...state, githubRepo: action.repo, githubBranch: action.repo.defaultBranch }
    case 'SET_GITHUB_BRANCH': return { ...state, githubBranch: action.branch }
    case 'SET_GITHUB_TOKEN': return { ...state, githubToken: action.token }
    case 'UPDATE_APP': {
      const merged = { ...state.app, ...action.patch }
      // Auto-generate appId from name
      if (action.patch.appName) merged.appId = slugifyAppId(action.patch.appName)
      return { ...state, app: merged }
    }
    case 'UPDATE_WINDOW': return { ...state, window: { ...state.window, ...action.patch } }
    case 'UPDATE_FEATURES': return { ...state, features: { ...state.features, ...action.patch } }
    case 'UPDATE_TARGETS': return { ...state, targets: { ...state.targets, ...action.patch } }
    case 'SET_LOGO': return { ...state, logoFile: action.file, logoPreview: action.preview }
    case 'CLEAR_LOGO': return { ...state, logoFile: null, logoPreview: null }
    case 'BUILD_START': return { ...state, buildId: action.buildId, buildStatus: 'uploading', buildLogs: [], buildOutputs: [], error: null }
    case 'BUILD_LOG': return { ...state, buildLogs: [...state.buildLogs, action.log] }
    case 'BUILD_DONE': return { ...state, buildStatus: 'done', buildOutputs: action.outputs }
    case 'BUILD_ERROR': return { ...state, buildStatus: 'error', error: action.error }
    case 'RESET': return { ...defaultBuilderState, githubToken: '' }
    default: return state
  }
}

export function useBuilder() {
  const [state, dispatch] = useReducer(reducer, { ...defaultBuilderState, githubToken: '' })

  const nextStep = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: Math.min(4, state.step + 1) as BuilderState['step'] })
  }, [state.step])

  const prevStep = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: Math.max(1, state.step - 1) as BuilderState['step'] })
  }, [state.step])

  const handleBuild = useCallback(async () => {
    const buildId = `b${Date.now()}`
    dispatch({ type: 'BUILD_START', buildId })
    dispatch({ type: 'SET_STEP', step: 4 })

    try {
      let response: Response

      if (state.sourceType === 'zip') {
        if (!state.zipFile) throw new Error('No ZIP file selected')
        const form = new FormData()
        form.append('zip', state.zipFile)
        form.append('config', JSON.stringify({
          app: state.app, window: state.window, features: state.features, targets: state.targets,
        }))
        if (state.logoFile) form.append('icon', state.logoFile)

        dispatch({ type: 'BUILD_LOG', log: { timestamp: Date.now(), level: 'info', message: '📤 Uploading ZIP file…' } })
        response = await fetch('/api/build', { method: 'POST', body: form })
      } else {
        if (!state.githubRepo) throw new Error('No repository selected')
        dispatch({ type: 'BUILD_LOG', log: { timestamp: Date.now(), level: 'info', message: `🔗 Cloning ${state.githubRepo.fullName}…` } })

        let iconBase64: string | undefined
        if (state.logoFile) {
          const buf = await state.logoFile.arrayBuffer()
          iconBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
        }

        response = await fetch('/api/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app: state.app, window: state.window, features: state.features, targets: state.targets,
            repoUrl: state.githubRepo.url,
            branch: state.githubBranch,
            token: state.githubToken || undefined,
            iconBase64,
          }),
        })
      }

      // Stream logs via SSE while build runs
      const buildData = await response.json() as { buildId?: string; error?: string; outputs?: unknown[] }
      if (!response.ok) throw new Error(buildData.error ?? 'Build failed')

      // Poll for logs
      if (buildData.buildId) {
        await streamBuildLogs(buildData.buildId, (log) => dispatch({ type: 'BUILD_LOG', log }))
      }

      // Fetch final status
      const statusRes = await fetch(`/api/build?buildId=${buildData.buildId}`)
      const status = await statusRes.json() as { status: string; outputs?: string[] }

      if (status.status === 'done' && buildData.outputs) {
        dispatch({
          type: 'BUILD_DONE',
          outputs: buildData.outputs as Array<{ filename: string; downloadUrl: string; sizeBytes: number }>,
        })
      } else {
        throw new Error('Build did not complete successfully')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({ type: 'BUILD_ERROR', error: msg })
    }
  }, [state])

  return { state, dispatch, nextStep, prevStep, handleBuild }
}

async function streamBuildLogs(buildId: string, onLog: (log: BuildLogEntry) => void): Promise<void> {
  return new Promise((resolve) => {
    const es = new EventSource(`/api/build/status?buildId=${buildId}`)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as { type: string; log?: BuildLogEntry; message?: string }
        if (data.type === 'log' && data.log) onLog(data.log)
        if (data.type === 'done' || data.type === 'error') { es.close(); resolve() }
      } catch { /* ignore */ }
    }
    es.onerror = () => { es.close(); resolve() }
    // Timeout after 10 minutes
    setTimeout(() => { es.close(); resolve() }, 600_000)
  })
}
