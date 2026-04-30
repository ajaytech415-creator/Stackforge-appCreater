import fs from 'fs'
import path from 'path'
import os from 'os'
import { detectProjectType, type ProjectDetection } from './projectDetector'
import { buildElectronMain } from './templates/main'
import { buildElectronPreload } from './templates/preload'
import { buildElectronPackageJson } from './templates/packageJson'
import type { AppConfig, WindowConfig, AppFeatures, TargetConfig } from '@/types'

/**
 * Create a minimal ICO file containing a PNG image.
 * Modern Windows supports PNG-in-ICO for sizes ≥ 256px.
 */
async function pngToIco(png512: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default

  // Generate multiple sizes needed for ICO
  const sizes = [16, 32, 48, 64, 128, 256]
  const pngBuffers = await Promise.all(
    sizes.map((s) =>
      sharp(png512)
        .resize(s, s, { fit: 'cover', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  )

  const numImages = pngBuffers.length
  const headerSize = 6
  const directorySize = 16 * numImages
  const offsets: number[] = []
  let currentOffset = headerSize + directorySize
  for (const buf of pngBuffers) {
    offsets.push(currentOffset)
    currentOffset += buf.length
  }

  const totalSize = currentOffset
  const icoBuffer = Buffer.alloc(totalSize)

  // ICO header
  icoBuffer.writeUInt16LE(0, 0)  // reserved
  icoBuffer.writeUInt16LE(1, 2)  // type: ICO
  icoBuffer.writeUInt16LE(numImages, 4)  // count

  // Directory entries
  pngBuffers.forEach((png, i) => {
    const s = sizes[i]!
    const base = 6 + i * 16
    icoBuffer.writeUInt8(s >= 256 ? 0 : s, base)      // width (0 = 256)
    icoBuffer.writeUInt8(s >= 256 ? 0 : s, base + 1)  // height
    icoBuffer.writeUInt8(0, base + 2)   // color count
    icoBuffer.writeUInt8(0, base + 3)   // reserved
    icoBuffer.writeUInt16LE(1, base + 4) // planes
    icoBuffer.writeUInt16LE(32, base + 6) // bit count
    icoBuffer.writeUInt32LE(png.length, base + 8)  // size
    icoBuffer.writeUInt32LE(offsets[i]!, base + 12) // offset
  })

  // Write image data
  pngBuffers.forEach((png, i) => { png.copy(icoBuffer, offsets[i]!) })

  return icoBuffer
}

/**
 * Prepare 512x512 PNG, generate .ico and .icns variants.
 * Returns { png, ico, icns } buffers.
 */
async function generateIcons(iconBuffer: Buffer | null): Promise<{ png: Buffer; ico: Buffer; icns: Buffer }> {
  const sharp = (await import('sharp')).default

  let png512: Buffer

  if (iconBuffer) {
    png512 = await sharp(iconBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 10, g: 4, b: 21, alpha: 1 } })
      .png()
      .toBuffer()
  } else {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e0a3d"/><stop offset="100%" stop-color="#0a0415"/>
        </linearGradient>
        <linearGradient id="ic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#bg)"/>
      <rect x="120" y="140" width="272" height="56" rx="28" fill="url(#ic)" opacity="0.95"/>
      <rect x="120" y="228" width="272" height="56" rx="28" fill="url(#ic)" opacity="0.75"/>
      <rect x="120" y="316" width="272" height="56" rx="28" fill="url(#ic)" opacity="0.55"/>
    </svg>`
    png512 = await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer()
  }

  const ico = await pngToIco(png512)

  // ICNS for macOS: use PNG for now (electron-builder accepts PNG-based ICNS on macOS)
  // On non-macOS hosts, macOS builds are not possible anyway
  const icns = png512 // Use PNG buffer as placeholder; only needed on macOS host

  return { png: png512, ico, icns }
}

export interface InjectionResult {
  projectDir: string
  detection: ProjectDetection
}

/**
 * Inject all Electron wrapper files into the project directory.
 */
export async function injectElectron(
  projectDir: string,
  app: AppConfig,
  window: WindowConfig,
  features: AppFeatures,
  targets: TargetConfig,
  iconBuffer: Buffer | null,
  serverPort = 3000,
): Promise<InjectionResult> {
  // 1. Detect project type
  const detection = detectProjectType(projectDir, serverPort)

  if (detection.mode === 'unknown') {
    throw new Error(
      `Could not detect project type in your ZIP.\n\n` +
      `StackForge supports:\n` +
      `• Static Web (index.html)\n` +
      `• Flask / Django / Python (app.py, manage.py, requirements.txt)\n` +
      `• Node.js / Express / Next.js (package.json + server.js/app.js)\n` +
      `• MERN Stack (package.json with start script)\n` +
      `• Laravel / PHP (artisan or index.php)\n` +
      `• Ruby on Rails (config.ru)\n` +
      `• Go (go.mod)\n` +
      `• Rust (Cargo.toml)\n\n` +
      `Make sure your project ZIP contains one of these entry-point files.`
    )
  }

  // 2. Write main.js (mode-aware)
  const mainJs = buildElectronMain(window, features, detection)
  fs.writeFileSync(path.join(projectDir, 'main.js'), mainJs, 'utf-8')

  // 3. Write preload.js
  const preloadJs = buildElectronPreload()
  fs.writeFileSync(path.join(projectDir, 'preload.js'), preloadJs, 'utf-8')

  // 4. Write package.json — for server projects, mark all existing deps as bundled
  const pkgJson = buildElectronPackageJson(app, targets, detection.entryFile ?? 'index.html')
  fs.writeFileSync(path.join(projectDir, 'package.json'), pkgJson, 'utf-8')

  // 5. Create build/ dir for icon assets
  const buildDir = path.join(projectDir, 'build')
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true })

  // 6. Generate all icon formats (PNG 512x512 + ICO multi-size + ICNS)
  const icons = await generateIcons(iconBuffer)
  fs.writeFileSync(path.join(buildDir, 'icon.png'), icons.png)   // Linux + fallback
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icons.ico)   // Windows NSIS
  fs.writeFileSync(path.join(buildDir, 'icon.icns'), icons.icns) // macOS DMG (PNG-in-ICNS placeholder)
  fs.writeFileSync(path.join(projectDir, 'icon.png'), icons.png)

  // 7. For server-mode projects: write a .env file with PORT
  if (detection.mode !== 'static') {
    const envContent = [`PORT=${detection.port}`, `ELECTRON_MODE=true`].join('\n')
    const envPath = path.join(projectDir, '.env')
    // Only write if .env doesn't already exist (don't overwrite user's config)
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, envContent, 'utf-8')
    }
  }

  return { projectDir, detection }
}

/**
 * Install electron + project dependencies inside the project directory.
 */
export async function installElectronDeps(
  projectDir: string,
  detection: ProjectDetection,
  onLog: (msg: string) => void,
): Promise<void> {
  const { execSync } = await import('child_process')

  // For Node projects: install their deps first
  if (detection.mode === 'node-server' && fs.existsSync(path.join(projectDir, 'package.json'))) {
    onLog('📦 Installing project dependencies (npm install)…')
    try {
      execSync('npm install', { cwd: projectDir, stdio: 'pipe', timeout: 180_000 })
      onLog('✓ Project dependencies installed')
    } catch (err) {
      onLog(`⚠ npm install warning: ${err instanceof Error ? err.message.slice(0, 200) : ''}`)
    }
  }

  // For Python projects: install requirements
  if ((detection.mode === 'python') && fs.existsSync(path.join(projectDir, 'requirements.txt'))) {
    onLog('📦 Installing Python requirements (pip install)…')
    try {
      execSync('pip install -r requirements.txt', { cwd: projectDir, stdio: 'pipe', timeout: 180_000 })
      onLog('✓ Python requirements installed')
    } catch (err) {
      onLog(`⚠ pip install warning: ${err instanceof Error ? err.message.slice(0, 200) : ''}`)
    }
  }
}

/**
 * Run electron-builder via CLI subprocess.
 * More reliable than programmatic API, and surfaces full error output.
 */
export async function runElectronBuilder(
  projectDir: string,
  targets: TargetConfig,
): Promise<string[]> {
  const { execSync } = await import('child_process')

  const platformFlags: string[] = []
  if (targets.windows) platformFlags.push('--win')
  if (targets.macos)   platformFlags.push('--mac')
  if (targets.linux)   platformFlags.push('--linux')
  if (platformFlags.length === 0) platformFlags.push('--win')

  const cmd = `npx electron-builder ${platformFlags.join(' ')}`

  try {
    execSync(cmd, {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: 300_000,
      env: { ...process.env, ELECTRON_BUILDER_CACHE: path.join(projectDir, '.eb-cache') },
    })
  } catch (err) {
    // Surface the actual error from electron-builder
    let details = ''
    if (err && typeof err === 'object') {
      const e = err as { stderr?: Buffer | string; stdout?: Buffer | string; message?: string }
      details = [
        e.stderr?.toString().slice(-2000) ?? '',
        e.stdout?.toString().slice(-1000) ?? '',
        e.message ?? '',
      ].filter(Boolean).join('\n').trim()
    }
    throw new Error(`electron-builder failed:\n${details}`)
  }

  const outputDir = path.join(projectDir, 'dist-electron')
  const outputs: string[] = []
  if (fs.existsSync(outputDir)) {
    const walk = (dir: string) => {
      for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f)
        if (fs.statSync(full).isDirectory()) { walk(full); continue }
        const ext = path.extname(f).toLowerCase()
        if (['.exe', '.dmg', '.appimage', '.deb', '.rpm'].includes(ext)) outputs.push(full)
      }
    }
    walk(outputDir)
  }
  return outputs
}

/**
 * Create a fresh temp directory for a build.
 */
export function createBuildDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'stackforge-'))
}

/**
 * Clean up a temp directory.
 */
export function cleanupDir(dir: string): void {
  try { fs.rmSync(dir, { recursive: true, force: true }) } catch { /* ignore */ }
}
