import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { buildDesktopApp, extractZipBuffer, cloneGitHubRepo } from '@/lib/builder'
import { buildStore } from '@/lib/buildStore'
import type { AppConfig, WindowConfig, AppFeatures, TargetConfig, BuildLogEntry } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: NextRequest): Promise<Response> {
  const buildId = `build-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  buildStore.set(buildId, { status: 'running', logs: [], outputs: [] })

  const cb = (log: BuildLogEntry) => {
    const entry = buildStore.get(buildId)
    if (entry) entry.logs.push(log)
  }

  let projectDir: string | null = null

  try {
    const contentType = request.headers.get('content-type') ?? ''
    let app: AppConfig, window: WindowConfig, features: AppFeatures, targets: TargetConfig
    let iconBuffer: Buffer | null = null
    let repoUrl = '', branch = 'main'
    let githubToken: string | undefined

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const configRaw = form.get('config')
      if (!configRaw || typeof configRaw !== 'string')
        return NextResponse.json({ error: 'Missing config field' }, { status: 400 })
      const config = JSON.parse(configRaw) as { app: AppConfig; window: WindowConfig; features: AppFeatures; targets: TargetConfig }
      app = config.app; window = config.window; features = config.features; targets = config.targets

      const zipEntry = form.get('zip')
      if (!zipEntry || typeof zipEntry === 'string')
        return NextResponse.json({ error: 'Missing zip file' }, { status: 400 })
      const zipFile = zipEntry as File
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer())

      const iconEntry = form.get('icon')
      if (iconEntry && typeof iconEntry !== 'string')
        iconBuffer = Buffer.from(await (iconEntry as File).arrayBuffer())

      cb({ timestamp: Date.now(), level: 'info', message: `📤 Received ZIP: ${zipFile.name} (${(zipBuffer.length / 1024).toFixed(0)} KB)` })
      projectDir = await extractZipBuffer(zipBuffer, cb)
    } else {
      const body = await request.json() as {
        app: AppConfig; window: WindowConfig; features: AppFeatures; targets: TargetConfig
        repoUrl: string; branch: string; token?: string; iconBase64?: string
      }
      app = body.app; window = body.window; features = body.features; targets = body.targets
      repoUrl = body.repoUrl; branch = body.branch ?? 'main'; githubToken = body.token

      if (body.iconBase64)
        iconBuffer = Buffer.from(body.iconBase64, 'base64')

      cb({ timestamp: Date.now(), level: 'info', message: `🔗 Source: GitHub — ${repoUrl}` })
      projectDir = await cloneGitHubRepo(repoUrl, branch, githubToken, cb)
    }

    const { outputs: outputFiles, detection } = await buildDesktopApp({
      projectDir, app, window, features, targets, iconBuffer, cb,
    })

    const serveDir = path.join(process.cwd(), 'public', 'builds', buildId)
    fs.mkdirSync(serveDir, { recursive: true })

    const downloadFiles = outputFiles.map((filePath) => {
      const name = path.basename(filePath)
      const dest = path.join(serveDir, name)
      fs.copyFileSync(filePath, dest)
      return { filename: name, downloadUrl: `/builds/${buildId}/${name}`, sizeBytes: fs.statSync(dest).size }
    })

    const entry = buildStore.get(buildId)!
    entry.status = 'done'
    entry.outputs = downloadFiles.map((f) => f.downloadUrl)

    return NextResponse.json({ buildId, outputs: downloadFiles, projectType: detection.label, projectMode: detection.mode })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    cb({ timestamp: Date.now(), level: 'error', message: `❌ ${message}` })
    const entry = buildStore.get(buildId)
    if (entry) { entry.status = 'error'; entry.error = message }
    return NextResponse.json({ error: message, buildId }, { status: 500 })
  } finally {
    if (projectDir) {
      setTimeout(() => {
        try { fs.rmSync(projectDir!, { recursive: true, force: true }) } catch { /* ignore */ }
      }, 30_000)
    }
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  const buildId = request.nextUrl.searchParams.get('buildId')
  if (!buildId) return NextResponse.json({ error: 'Missing buildId' }, { status: 400 })
  const entry = buildStore.get(buildId)
  if (!entry) return NextResponse.json({ error: 'Build not found' }, { status: 404 })
  return NextResponse.json(entry)
}
