/**
 * Detects the project type from a directory and returns the correct
 * Electron packaging mode + startup command.
 */
import fs from 'fs'
import path from 'path'

export type ProjectMode = 'static' | 'node-server' | 'python' | 'php' | 'ruby' | 'go' | 'rust' | 'unknown'

export interface ProjectDetection {
  mode: ProjectMode
  label: string              // human-readable e.g. "Flask (Python)"
  entryFile?: string         // for static mode: relative path to index.html
  startCommand?: string      // for server mode: command to spawn
  startArgs?: string[]       // args to the command
  port: number               // server port to load in Electron
  envVars?: Record<string, string>  // extra env vars to pass to server
}

/** Recursive file search up to depth levels */
function findFile(dir: string, name: string, depth = 2): string | null {
  if (depth < 0) return null
  try {
    const entries = fs.readdirSync(dir)
    for (const e of entries) {
      const full = path.join(dir, e)
      if (e === name) return full
      try {
        if (fs.statSync(full).isDirectory()) {
          const found = findFile(full, name, depth - 1)
          if (found) return found
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return null
}

function exists(dir: string, ...parts: string[]): boolean {
  return fs.existsSync(path.join(dir, ...parts))
}

function readJson(filePath: string): Record<string, unknown> {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown> }
  catch { return {} }
}

/** Find the index.html — checks common build output dirs */
function findIndexHtml(dir: string): string | null {
  const candidates = [
    'index.html', 'index.htm',
    'public/index.html', 'static/index.html',
    'dist/index.html', 'dist/public/index.html',
    'build/index.html', 'out/index.html',
    'www/index.html', 'web/index.html',
    'frontend/dist/index.html', 'frontend/build/index.html',
    'client/dist/index.html', 'client/build/index.html',
    'frontend/index.html', 'client/index.html',
  ]
  for (const c of candidates) {
    if (fs.existsSync(path.join(dir, c))) return c
  }
  // Walk 2 levels for any html file
  const html = findFile(dir, 'index.html', 2)
  if (html) return path.relative(dir, html)
  return null
}

/** Read package.json scripts to find a start command */
function getNodeStartCommand(dir: string): { cmd: string; args: string[] } | null {
  const pkgPath = path.join(dir, 'package.json')
  if (!fs.existsSync(pkgPath)) return null
  const pkg = readJson(pkgPath)
  const scripts = (pkg.scripts ?? {}) as Record<string, string>

  // Prefer: start > serve > preview > dev
  for (const script of ['start', 'serve', 'preview']) {
    if (scripts[script]) return { cmd: 'npm', args: ['run', script] }
  }

  // Check for direct entry files
  const main = typeof pkg.main === 'string' ? pkg.main : null
  if (main && fs.existsSync(path.join(dir, main))) {
    return { cmd: 'node', args: [main] }
  }
  for (const entry of ['server.js', 'app.js', 'index.js', 'src/index.js', 'src/server.js', 'src/app.js']) {
    if (fs.existsSync(path.join(dir, entry))) return { cmd: 'node', args: [entry] }
  }
  // Fall back to dev if nothing else
  if (scripts.dev) return { cmd: 'npm', args: ['run', 'dev'] }
  return null
}

/** Main detection function */
export function detectProjectType(dir: string, userPort = 3000): ProjectDetection {
  // ─── STATIC: index.html found ───────────────────────────────────────────
  const htmlEntry = findIndexHtml(dir)
  if (htmlEntry) {
    return { mode: 'static', label: 'Static Web (HTML/CSS/JS)', entryFile: htmlEntry, port: 0 }
  }

  // ─── PYTHON ──────────────────────────────────────────────────────────────
  const hasPyReqs = exists(dir, 'requirements.txt') || exists(dir, 'Pipfile') || exists(dir, 'pyproject.toml')

  if (exists(dir, 'manage.py')) {
    return {
      mode: 'python', label: 'Django',
      startCommand: 'python', startArgs: ['manage.py', 'runserver', `0.0.0.0:${userPort}`],
      port: userPort,
    }
  }
  if (exists(dir, 'app.py') && hasPyReqs) {
    return { mode: 'python', label: 'Flask', startCommand: 'python', startArgs: ['app.py'], port: userPort, envVars: { FLASK_RUN_PORT: String(userPort) } }
  }
  if (exists(dir, 'main.py') && hasPyReqs) {
    return { mode: 'python', label: 'Python (main.py)', startCommand: 'python', startArgs: ['main.py'], port: userPort }
  }
  if (exists(dir, 'run.py') && hasPyReqs) {
    return { mode: 'python', label: 'Python (run.py)', startCommand: 'python', startArgs: ['run.py'], port: userPort }
  }
  if (hasPyReqs) {
    // Try to find any .py file that might be the entry
    const pyFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.py') && !f.startsWith('_'))
    if (pyFiles[0]) {
      return { mode: 'python', label: `Python (${pyFiles[0]})`, startCommand: 'python', startArgs: [pyFiles[0]!], port: userPort }
    }
  }

  // ─── NODE.JS / MERN / EXPRESS / NEXT ─────────────────────────────────────
  if (exists(dir, 'package.json')) {
    const nodeCmd = getNodeStartCommand(dir)
    const pkg = readJson(path.join(dir, 'package.json'))
    const deps = { ...((pkg.dependencies ?? {}) as Record<string, string>), ...((pkg.devDependencies ?? {}) as Record<string, string>) }

    let label = 'Node.js'
    if ('next' in deps) label = 'Next.js'
    else if ('express' in deps) label = 'Express (Node.js)'
    else if ('fastify' in deps) label = 'Fastify (Node.js)'
    else if ('@nestjs/core' in deps) label = 'NestJS'
    else if ('nuxt' in deps) label = 'Nuxt.js'
    else if ('@sveltejs/kit' in deps) label = 'SvelteKit'
    else if ('vite' in deps) label = 'Vite App'

    if (nodeCmd) {
      return { mode: 'node-server', label, startCommand: nodeCmd.cmd, startArgs: nodeCmd.args, port: userPort }
    }
  }

  // ─── PHP / LARAVEL ────────────────────────────────────────────────────────
  if (exists(dir, 'artisan')) {
    return { mode: 'php', label: 'Laravel (PHP)', startCommand: 'php', startArgs: ['artisan', 'serve', `--port=${userPort}`], port: userPort }
  }
  if (exists(dir, 'index.php') || exists(dir, 'public', 'index.php')) {
    return { mode: 'php', label: 'PHP', startCommand: 'php', startArgs: ['-S', `127.0.0.1:${userPort}`, '-t', exists(dir, 'public') ? 'public' : '.'], port: userPort }
  }

  // ─── RUBY / RAILS ────────────────────────────────────────────────────────
  if (exists(dir, 'config.ru')) {
    return { mode: 'ruby', label: 'Ruby on Rails', startCommand: 'rails', startArgs: ['server', '-p', String(userPort)], port: userPort }
  }
  if (exists(dir, 'Gemfile')) {
    return { mode: 'ruby', label: 'Ruby', startCommand: 'bundle', startArgs: ['exec', 'ruby', 'app.rb'], port: userPort }
  }

  // ─── GO ───────────────────────────────────────────────────────────────────
  if (exists(dir, 'go.mod')) {
    return { mode: 'go', label: 'Go', startCommand: 'go', startArgs: ['run', '.'], port: userPort, envVars: { PORT: String(userPort) } }
  }

  // ─── RUST ─────────────────────────────────────────────────────────────────
  if (exists(dir, 'Cargo.toml')) {
    return { mode: 'rust', label: 'Rust', startCommand: 'cargo', startArgs: ['run'], port: userPort, envVars: { PORT: String(userPort) } }
  }

  // ─── UNKNOWN — last resort: try to find any .html file ────────────────────
  const anyHtml = findFile(dir, '.html', 3)
  if (anyHtml) {
    const rel = path.relative(dir, anyHtml)
    return { mode: 'static', label: 'Static Web', entryFile: rel, port: 0 }
  }

  return { mode: 'unknown', label: 'Unknown project type', port: userPort }
}
