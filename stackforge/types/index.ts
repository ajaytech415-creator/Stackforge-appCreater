import { z } from 'zod'

// ── Build targets ──────────────────────────────────────────────────────────
export const BUILD_TARGETS = ['windows', 'macos', 'linux'] as const
export type BuildTarget = (typeof BUILD_TARGETS)[number]

// ── Input source ───────────────────────────────────────────────────────────
export type InputSourceType = 'zip' | 'github'

export interface ZipSource { type: 'zip' }
export interface GitHubSource {
  type: 'github'
  repoUrl: string
  branch: string
  token?: string
}
export type InputSource = ZipSource | GitHubSource

// ── App configuration ──────────────────────────────────────────────────────
export interface AppConfig {
  appName: string              // e.g. "My Cool App"
  appId: string                // e.g. "com.example.mycoolapp"
  description: string
  version: string              // semver, default "1.0.0"
  authorName: string
  authorEmail: string
  copyright: string            // auto-generated from authorName + year
}

// ── Window configuration ────────────────────────────────────────────────────
export interface WindowConfig {
  width: number               // default 1280
  height: number              // default 800
  minWidth: number            // default 800
  minHeight: number           // default 600
  resizable: boolean
  fullscreenable: boolean
  frameless: boolean          // removes OS window chrome
  alwaysOnTop: boolean
  titleBarStyle: 'default' | 'hidden' | 'hiddenInset'
}

// ── App feature flags ───────────────────────────────────────────────────────
export interface AppFeatures {
  menuBar: boolean            // show/hide native menu bar
  trayIcon: boolean           // system tray icon
  singleInstance: boolean     // prevent multiple instances
  devTools: boolean           // allow DevTools shortcut
  contextMenu: boolean        // right-click context menu
  nativeNotifications: boolean
  autoHideMenuBar: boolean
}

// ── Build targets selection ─────────────────────────────────────────────────
export interface TargetConfig {
  windows: boolean            // produce .exe installer
  macos: boolean              // produce .dmg
  linux: boolean              // produce .AppImage
}

// ── Full build request (sent to API) ───────────────────────────────────────
export interface BuildRequest {
  source: InputSource
  app: AppConfig
  window: WindowConfig
  features: AppFeatures
  targets: TargetConfig
}

// ── Build status ─────────────────────────────────────────────────────────────
export type BuildStatus =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'injecting'
  | 'packaging'
  | 'done'
  | 'error'

export interface BuildLogEntry {
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
}

export interface BuildResult {
  buildId: string
  outputs: BuildOutput[]
  durationMs: number
}

export interface BuildOutput {
  platform?: BuildTarget
  filename: string
  sizeBytes: number
  downloadUrl: string
}

// ── GitHub types ─────────────────────────────────────────────────────────────
export interface GitHubRepo {
  id: number
  name: string
  fullName: string
  description: string | null
  isPrivate: boolean
  defaultBranch: string
  url: string
  updatedAt: string
  language: string | null
}

export interface GitHubBranch {
  name: string
  isDefault: boolean
}

// ── Builder UI state ──────────────────────────────────────────────────────────
export interface BuilderState {
  step: 1 | 2 | 3 | 4
  sourceType: InputSourceType
  zipFile: File | null
  githubRepo: GitHubRepo | null
  githubBranch: string
  app: AppConfig
  window: WindowConfig
  features: AppFeatures
  targets: TargetConfig
  logoFile: File | null
  logoPreview: string | null
  buildId: string | null
  buildStatus: BuildStatus
  buildLogs: BuildLogEntry[]
  buildOutputs: BuildOutput[]
  error: string | null
}

// ── Defaults ───────────────────────────────────────────────────────────────
export const defaultAppConfig: AppConfig = {
  appName: 'My Desktop App',
  appId: 'com.example.mydesktopapp',
  description: '',
  version: '1.0.0',
  authorName: '',
  authorEmail: '',
  copyright: `Copyright © ${new Date().getFullYear()}`,
}

export const defaultWindowConfig: WindowConfig = {
  width: 1280,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  resizable: true,
  fullscreenable: true,
  frameless: false,
  alwaysOnTop: false,
  titleBarStyle: 'default',
}

export const defaultFeatures: AppFeatures = {
  menuBar: true,
  trayIcon: false,
  singleInstance: true,
  devTools: false,
  contextMenu: true,
  nativeNotifications: true,
  autoHideMenuBar: false,
}

export const defaultTargets: TargetConfig = {
  windows: true,
  macos: false,
  linux: false,
}

export const defaultBuilderState: BuilderState = {
  step: 1,
  sourceType: 'zip',
  zipFile: null,
  githubRepo: null,
  githubBranch: 'main',
  app: defaultAppConfig,
  window: defaultWindowConfig,
  features: defaultFeatures,
  targets: defaultTargets,
  logoFile: null,
  logoPreview: null,
  buildId: null,
  buildStatus: 'idle',
  buildLogs: [],
  buildOutputs: [],
  error: null,
}

// ── Zod validation ─────────────────────────────────────────────────────────
export const appConfigSchema = z.object({
  appName: z.string().min(1, 'App name is required').max(100),
  appId: z.string().regex(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/, 'Use format: com.company.appname'),
  description: z.string().max(500).default(''),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Use semver: 1.0.0').default('1.0.0'),
  authorName: z.string().max(100).default(''),
  authorEmail: z.string().email().or(z.literal('')).default(''),
  copyright: z.string().max(200).default(''),
})

export const windowConfigSchema = z.object({
  width: z.number().int().min(200).max(7680).default(1280),
  height: z.number().int().min(200).max(4320).default(800),
  minWidth: z.number().int().min(200).max(7680).default(800),
  minHeight: z.number().int().min(200).max(4320).default(600),
  resizable: z.boolean().default(true),
  fullscreenable: z.boolean().default(true),
  frameless: z.boolean().default(false),
  alwaysOnTop: z.boolean().default(false),
  titleBarStyle: z.enum(['default', 'hidden', 'hiddenInset']).default('default'),
})

export const appFeaturesSchema = z.object({
  menuBar: z.boolean().default(true),
  trayIcon: z.boolean().default(false),
  singleInstance: z.boolean().default(true),
  devTools: z.boolean().default(false),
  contextMenu: z.boolean().default(true),
  nativeNotifications: z.boolean().default(true),
  autoHideMenuBar: z.boolean().default(false),
})

export function validateAppConfig(data: unknown): AppConfig {
  return appConfigSchema.parse(data)
}

export function validateWindowConfig(data: unknown): WindowConfig {
  return windowConfigSchema.parse(data)
}

export function slugifyAppId(name: string): string {
  return 'com.stackforge.' + name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30) || 'app'
}
