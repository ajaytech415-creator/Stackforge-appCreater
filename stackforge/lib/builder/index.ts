import fs from 'fs'
import path from 'path'
import os from 'os'
import type { AppConfig, WindowConfig, AppFeatures, TargetConfig, BuildLogEntry } from '@/types'
import type { ProjectDetection } from './projectDetector'
import {
  injectElectron,
  installElectronDeps,
  runElectronBuilder,
  createBuildDir,
} from './electronInjector'

export type ProgressCallback = (log: BuildLogEntry) => void

function log(cb: ProgressCallback, level: BuildLogEntry['level'], message: string) {
  cb({ timestamp: Date.now(), level, message })
}

/**
 * Extract a ZIP buffer into a directory, returns the project directory path.
 */
export async function extractZipBuffer(
  buffer: Buffer,
  cb: ProgressCallback,
): Promise<string> {
  const { default: extractZip } = await import('extract-zip')
  const dir = createBuildDir()
  log(cb, 'info', `Extracting uploaded ZIP…`)
  const tmpZip = path.join(os.tmpdir(), `sf-upload-${Date.now()}.zip`)
  fs.writeFileSync(tmpZip, buffer)
  await extractZip(tmpZip, { dir })
  fs.unlinkSync(tmpZip)

  // If ZIP had a single root folder, use that
  const entries = fs.readdirSync(dir)
  if (entries.length === 1) {
    const single = path.join(dir, entries[0]!)
    if (fs.statSync(single).isDirectory()) {
      log(cb, 'info', `Single root folder detected: ${entries[0]}`)
      return single
    }
  }
  log(cb, 'success', `Extracted ${entries.length} items`)
  return dir
}

/**
 * Clone a GitHub repository into a temp directory.
 */
export async function cloneGitHubRepo(
  repoUrl: string,
  branch: string,
  token: string | undefined,
  cb: ProgressCallback,
): Promise<string> {
  const { simpleGit } = await import('simple-git')
  const dir = createBuildDir()

  let cloneUrl = repoUrl
  if (token) {
    const parsed = new URL(repoUrl)
    parsed.username = 'oauth2'
    parsed.password = token
    cloneUrl = parsed.toString()
  }

  log(cb, 'info', `Cloning ${repoUrl} (branch: ${branch})…`)
  const git = simpleGit()
  await git.clone(cloneUrl, dir, ['--branch', branch, '--depth', '1'])
  log(cb, 'success', `Repository cloned successfully`)
  return dir
}

/**
 * Full build pipeline.
 */
export async function buildDesktopApp(options: {
  projectDir: string
  app: AppConfig
  window: WindowConfig
  features: AppFeatures
  targets: TargetConfig
  iconBuffer: Buffer | null
  cb: ProgressCallback
  serverPort?: number
}): Promise<{ outputs: string[]; detection: ProjectDetection }> {
  const { projectDir, app, window, features, targets, iconBuffer, cb, serverPort = 3000 } = options

  // Step 1 — Detect project type + inject Electron
  log(cb, 'info', '🔍 Detecting project type…')
  const { detection } = await injectElectron(projectDir, app, window, features, targets, iconBuffer, serverPort)
  log(cb, 'success', `✓ Detected: ${detection.label} (${detection.mode} mode)`)

  if (detection.mode !== 'static') {
    log(cb, 'info', `⚙️  Server mode: will spawn \`${detection.startCommand} ${(detection.startArgs ?? []).join(' ')}\` and load http://localhost:${detection.port}`)
  }

  log(cb, 'info', '⚡ Injecting Electron wrapper (main.js, preload.js)…')
  log(cb, 'success', '✓ Electron wrapper injected')

  // Step 2 — Install dependencies
  await installElectronDeps(projectDir, detection, (msg) => log(cb, 'info', msg))
  log(cb, 'success', '✓ Dependencies ready')

  // Step 3 — Install electron itself in the project dir
  log(cb, 'info', '📦 Installing electron & electron-builder…')
  const { execSync } = await import('child_process')
  try {
    execSync('npm install electron electron-builder --save-dev', {
      cwd: projectDir, stdio: 'pipe', timeout: 180_000,
    })
    log(cb, 'success', '✓ Electron installed')
  } catch (err) {
    log(cb, 'warn', `npm install warning: ${err instanceof Error ? err.message.slice(0, 200) : ''}`)
  }

  // Step 4 — Build with electron-builder
  const platformNames = [
    targets.windows && 'Windows (.exe)',
    targets.macos && 'macOS (.dmg)',
    targets.linux && 'Linux (.AppImage)',
  ].filter(Boolean).join(', ')
  log(cb, 'info', `🔨 Building for: ${platformNames}…`)

  const outputs = await runElectronBuilder(projectDir, targets)

  if (outputs.length === 0) {
    throw new Error('electron-builder produced no output files. Check the build log above for errors.')
  }

  log(cb, 'success', `✓ Build complete — ${outputs.length} file(s) ready`)
  outputs.forEach((f) => log(cb, 'info', `  📁 ${path.basename(f)}`))

  return { outputs, detection }
}
