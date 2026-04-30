'use client'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useBuilder } from '@/components/builder/useBuilder'
import { SourcePicker } from '@/components/builder/SourcePicker'
import { AppSettingsForm } from '@/components/builder/AppSettingsForm'
import { WindowConfigForm } from '@/components/builder/WindowConfigForm'
import { BuildProgress } from '@/components/builder/BuildProgress'
import { Button } from '@/components/ui/Button'

const STEPS = [
  { n: 1, label: 'Source' },
  { n: 2, label: 'App Info' },
  { n: 3, label: 'Settings' },
  { n: 4, label: 'Build' },
] as const

function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex items-center gap-1" aria-label="Build progress">
      {STEPS.map(({ n, label }, i) => (
        <li key={n} className="flex items-center gap-1">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 ${step >= n ? 'bg-brand/20 text-brand-light border border-brand/30' : 'bg-white/[0.03] text-white/30 border border-white/[0.06]'} ${step === n ? 'shadow-md shadow-brand/20 scale-105' : ''}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${step > n ? 'bg-brand text-white' : step === n ? 'bg-brand text-white' : 'bg-white/10 text-white/30'}`}>
              {step > n ? <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : n}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-px w-6 transition-colors duration-500 ${step > n ? 'bg-brand/40' : 'bg-white/[0.06]'}`} />}
        </li>
      ))}
    </ol>
  )
}

function canProceed(step: 1 | 2 | 3 | 4, state: ReturnType<typeof useBuilder>['state']): boolean {
  if (step === 1) return state.sourceType === 'zip' ? !!state.zipFile : !!state.githubRepo
  if (step === 2) return !!state.app.appName.trim()
  if (step === 3) return state.targets.windows || state.targets.macos || state.targets.linux
  return false
}

function Page() {
  const { state, dispatch, nextStep, prevStep, handleBuild } = useBuilder()

  const isBuilding = !['idle','done','error'].includes(state.buildStatus)

  return (
    <div className="relative mx-auto max-w-3xl px-6 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-brand/8 blur-[100px]" />

      <div className="relative mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Web → Desktop App
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Upload your web project and get a native desktop installer.
          </p>
        </div>
        <StepIndicator step={state.step} />
      </div>

      {/* Error banner */}
      {state.error && state.step !== 4 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-up" role="alert">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {state.error}
        </div>
      )}

      {/* Step content */}
      <div className="animate-fade-up">

        {/* STEP 1 — Source */}
        {state.step === 1 && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Choose Source</h2>
              <SourcePicker
                sourceType={state.sourceType}
                zipFile={state.zipFile}
                githubRepo={state.githubRepo}
                githubBranch={state.githubBranch}
                onSourceTypeChange={(t) => dispatch({ type: 'SET_SOURCE_TYPE', sourceType: t })}
                onZipSelect={(f) => dispatch({ type: 'SET_ZIP_FILE', file: f })}
                onRepoSelect={(r) => dispatch({ type: 'SET_GITHUB_REPO', repo: r })}
                onBranchChange={(b) => dispatch({ type: 'SET_GITHUB_BRANCH', branch: b })}
              />
            </div>
          </div>
        )}

        {/* STEP 2 — App Settings */}
        {state.step === 2 && (
          <AppSettingsForm
            app={state.app}
            logoPreview={state.logoPreview}
            onChange={(patch) => dispatch({ type: 'UPDATE_APP', patch })}
            onLogoSelect={(file, preview) => dispatch({ type: 'SET_LOGO', file, preview })}
            onLogoClear={() => dispatch({ type: 'CLEAR_LOGO' })}
          />
        )}

        {/* STEP 3 — Window & Features */}
        {state.step === 3 && (
          <WindowConfigForm
            window={state.window}
            features={state.features}
            targets={state.targets}
            onWindowChange={(patch) => dispatch({ type: 'UPDATE_WINDOW', patch })}
            onFeaturesChange={(patch) => dispatch({ type: 'UPDATE_FEATURES', patch })}
            onTargetsChange={(patch) => dispatch({ type: 'UPDATE_TARGETS', patch })}
          />
        )}

        {/* STEP 4 — Build Progress */}
        {state.step === 4 && (
          <BuildProgress
            status={state.buildStatus}
            logs={state.buildLogs}
            outputs={state.buildOutputs}
            error={state.error}
            appName={state.app.appName}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={state.step === 1 || isBuilding}
        >
          <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </Button>

        <div className="flex items-center gap-3">
          {state.step === 4 && state.buildStatus === 'done' && (
            <Button variant="ghost" onClick={() => dispatch({ type: 'RESET' })} className="border border-white/10 text-white/60 hover:text-white">
              Build Another
            </Button>
          )}
          {state.step < 3 && (
            <Button onClick={nextStep} disabled={!canProceed(state.step, state)}>
              Next
              <svg className="ml-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </Button>
          )}
          {state.step === 3 && (
            <Button onClick={handleBuild} disabled={!canProceed(3, state)}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Build Desktop App
            </Button>
          )}
          {state.step === 4 && isBuilding && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-brand"/>
              Building… this takes 1-3 minutes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BuildPage() {
  return <ErrorBoundary><Suspense fallback={null}><Page /></Suspense></ErrorBoundary>
}
