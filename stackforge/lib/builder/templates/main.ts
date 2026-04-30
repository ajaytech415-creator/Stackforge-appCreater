import type { WindowConfig, AppFeatures } from '@/types'
import type { ProjectDetection } from '../projectDetector'

export function buildElectronMain(
  window: WindowConfig,
  features: AppFeatures,
  detection: ProjectDetection,
): string {
  const lines: string[] = []
  const isServer = detection.mode !== 'static'
  const port = detection.port || 3000

  lines.push(`'use strict'`)
  lines.push(`const { app, BrowserWindow, Menu, Tray, shell, nativeImage, ipcMain } = require('electron')`)
  lines.push(`const path = require('path')`)
  if (isServer) {
    lines.push(`const { spawn } = require('child_process')`)
    lines.push(`const http = require('http')`)
  } else {
    lines.push(`const url = require('url')`)
  }
  lines.push(``)

  if (features.singleInstance) {
    lines.push(`const gotTheLock = app.requestSingleInstanceLock()`)
    lines.push(`if (!gotTheLock) { app.quit() }`)
    lines.push(``)
  }

  lines.push(`let mainWindow = null`)
  if (features.trayIcon) lines.push(`let tray = null`)
  if (isServer) lines.push(`let serverProcess = null`)
  lines.push(`const SERVER_PORT = ${port}`)
  lines.push(``)

  // ── Server startup function (for non-static projects) ──────────────────────
  if (isServer) {
    const cmd = JSON.stringify(detection.startCommand ?? 'node')
    const args = JSON.stringify(detection.startArgs ?? [])
    const envVars = detection.envVars ? JSON.stringify(detection.envVars) : '{}'

    lines.push(`function startServer() {`)
    lines.push(`  const cmd = ${cmd}`)
    lines.push(`  const args = ${args}`)
    lines.push(`  const extraEnv = ${envVars}`)
    lines.push(`  const env = { ...process.env, ...extraEnv, PORT: String(SERVER_PORT) }`)
    lines.push(`  serverProcess = spawn(cmd, args, { cwd: __dirname, env, stdio: 'pipe' })`)
    lines.push(`  serverProcess.stdout.on('data', (d) => console.log('[server]', d.toString()))`)
    lines.push(`  serverProcess.stderr.on('data', (d) => console.error('[server]', d.toString()))`)
    lines.push(`  serverProcess.on('error', (err) => console.error('[server] failed to start:', err))`)
    lines.push(`  serverProcess.on('exit', (code) => console.log('[server] exited with code', code))`)
    lines.push(`}`)
    lines.push(``)

    lines.push(`function waitForServer(url, retries, cb) {`)
    lines.push(`  http.get(url, (res) => {`)
    lines.push(`    cb(null)`)
    lines.push(`  }).on('error', () => {`)
    lines.push(`    if (retries <= 0) { cb(new Error('Server did not start in time')); return }`)
    lines.push(`    setTimeout(() => waitForServer(url, retries - 1, cb), 500)`)
    lines.push(`  })`)
    lines.push(`}`)
    lines.push(``)
  }

  // ── createWindow ──────────────────────────────────────────────────────────
  lines.push(`function createWindow() {`)
  lines.push(`  const iconPath = path.join(__dirname, 'icon.png')`)
  lines.push(`  mainWindow = new BrowserWindow({`)
  lines.push(`    width: ${window.width},`)
  lines.push(`    height: ${window.height},`)
  lines.push(`    minWidth: ${window.minWidth},`)
  lines.push(`    minHeight: ${window.minHeight},`)
  lines.push(`    resizable: ${window.resizable},`)
  lines.push(`    fullscreenable: ${window.fullscreenable},`)
  lines.push(`    frame: ${!window.frameless},`)
  lines.push(`    alwaysOnTop: ${window.alwaysOnTop},`)
  lines.push(`    titleBarStyle: '${window.titleBarStyle}',`)
  lines.push(`    autoHideMenuBar: ${features.autoHideMenuBar},`)
  lines.push(`    icon: iconPath,`)
  lines.push(`    show: false,`)
  lines.push(`    webPreferences: {`)
  lines.push(`      preload: path.join(__dirname, 'preload.js'),`)
  lines.push(`      nodeIntegration: false,`)
  lines.push(`      contextIsolation: true,`)
  if (!features.devTools) lines.push(`      devTools: false,`)
  lines.push(`    },`)
  lines.push(`  })`)
  lines.push(``)

  if (isServer) {
    lines.push(`  // Show loading screen while server starts`)
    lines.push(`  mainWindow.loadURL('data:text/html,<style>body{background:#0a0415;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#c084fc}</style><body><div style="text-align:center"><div style="font-size:3em;margin-bottom:1em">⚡</div><h2>Starting ${detection.label}…</h2><p style="color:#888;font-size:0.9em">Please wait</p></div></body>')`)
    lines.push(`  mainWindow.once('ready-to-show', () => mainWindow.show())`)
    lines.push(``)
    lines.push(`  // Wait for server then load`)
    lines.push(`  waitForServer('http://127.0.0.1:' + SERVER_PORT, 60, (err) => {`)
    lines.push(`    if (err) {`)
    lines.push(`      mainWindow.loadURL('data:text/html,<style>body{background:#0a0415;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;color:#f87171}</style><body><div style="text-align:center"><h2>Server failed to start</h2><p>' + err.message + '</p></div></body>')`)
    lines.push(`    } else {`)
    lines.push(`      mainWindow.loadURL('http://127.0.0.1:' + SERVER_PORT)`)
    lines.push(`    }`)
    lines.push(`  })`)
  } else {
    const entry = detection.entryFile ?? 'index.html'
    lines.push(`  const startUrl = require('url').format({`)
    lines.push(`    pathname: path.join(__dirname, '${entry}'),`)
    lines.push(`    protocol: 'file:',`)
    lines.push(`    slashes: true,`)
    lines.push(`  })`)
    lines.push(`  mainWindow.loadURL(startUrl)`)
    lines.push(`  mainWindow.once('ready-to-show', () => mainWindow.show())`)
  }
  lines.push(``)

  if (!features.menuBar) {
    lines.push(`  Menu.setApplicationMenu(null)`)
  }
  if (features.devTools) {
    lines.push(`  mainWindow.webContents.on('before-input-event', (_, input) => {`)
    lines.push(`    if (input.key === 'F12') mainWindow.webContents.toggleDevTools()`)
    lines.push(`  })`)
  }
  if (features.contextMenu) {
    lines.push(`  mainWindow.webContents.on('context-menu', (_, params) => {`)
    lines.push(`    const menu = Menu.buildFromTemplate([{ role: 'copy' }, { role: 'paste' }, { type: 'separator' }, { role: 'reload' }, { role: 'togglefullscreen' }])`)
    lines.push(`    menu.popup({ window: mainWindow })`)
    lines.push(`  })`)
  }

  lines.push(`  mainWindow.on('closed', () => { mainWindow = null })`)
  lines.push(`}`)
  lines.push(``)

  // ── Tray ─────────────────────────────────────────────────────────────────
  if (features.trayIcon) {
    lines.push(`function createTray() {`)
    lines.push(`  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'icon.png')))`)
    lines.push(`  tray.setToolTip(app.getName())`)
    lines.push(`  const contextMenu = Menu.buildFromTemplate([`)
    lines.push(`    { label: 'Show', click: () => { if (mainWindow) mainWindow.show() } },`)
    lines.push(`    { type: 'separator' },`)
    lines.push(`    { label: 'Quit', click: () => app.quit() },`)
    lines.push(`  ])`)
    lines.push(`  tray.setContextMenu(contextMenu)`)
    lines.push(`  tray.on('click', () => { if (mainWindow) mainWindow.show() })`)
    lines.push(`}`)
    lines.push(``)
  }

  if (features.singleInstance) {
    lines.push(`app.on('second-instance', () => {`)
    lines.push(`  if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus() }`)
    lines.push(`})`)
    lines.push(``)
  }

  lines.push(`app.whenReady().then(() => {`)
  if (isServer) lines.push(`  startServer()`)
  lines.push(`  createWindow()`)
  if (features.trayIcon) lines.push(`  createTray()`)
  lines.push(`  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })`)
  lines.push(`})`)
  lines.push(``)
  lines.push(`app.on('window-all-closed', () => {`)
  if (!features.trayIcon) lines.push(`  if (process.platform !== 'darwin') app.quit()`)
  lines.push(`})`)
  lines.push(``)

  if (isServer) {
    lines.push(`app.on('before-quit', () => {`)
    lines.push(`  if (serverProcess) { serverProcess.kill(); serverProcess = null }`)
    lines.push(`})`)
  }

  lines.push(``)
  return lines.join('\n')
}
