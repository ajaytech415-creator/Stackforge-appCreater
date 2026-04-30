'use client'
import type { WindowConfig, AppFeatures, TargetConfig } from '@/types'
import { Toggle } from '@/components/ui/Toggle'
import { IconWindows, IconApple, IconLinux } from '@/components/ui/Icons'
import type { ComponentType } from 'react'

interface Props {
  window: WindowConfig
  features: AppFeatures
  targets: TargetConfig
  onWindowChange: (patch: Partial<WindowConfig>) => void
  onFeaturesChange: (patch: Partial<AppFeatures>) => void
  onTargetsChange: (patch: Partial<TargetConfig>) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">{title}</h3>
      {children}
    </div>
  )
}

function ToggleRow({ id, label, desc, checked, onChange }: { id: string; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium text-white/90">{label}</p>
        <p className="text-xs text-white/40">{desc}</p>
      </div>
      <Toggle id={id} label={label} checked={checked} onChange={onChange} />
    </div>
  )
}

const PLATFORMS: Array<{ key: 'windows' | 'macos' | 'linux'; label: string; ext: string; Icon: ComponentType<{ className?: string }>; note: string }> = [
  { key: 'windows', label: 'Windows', ext: '.exe', Icon: IconWindows, note: 'NSIS installer' },
  { key: 'macos', label: 'macOS', ext: '.dmg', Icon: IconApple, note: 'Disk image (requires macOS to build)' },
  { key: 'linux', label: 'Linux', ext: '.AppImage', Icon: IconLinux, note: 'AppImage + .deb' },
]

export function WindowConfigForm({ window, features, targets, onWindowChange, onFeaturesChange, onTargetsChange }: Props) {
  return (
    <div className="space-y-5">
      {/* Target Platforms */}
      <Section title="Target Platforms">
        <div className="grid gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onTargetsChange({ [p.key]: !targets[p.key] })}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                targets[p.key]
                  ? 'border-brand/30 bg-brand/8 shadow-sm shadow-brand/10'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/10 shrink-0">
                <p.Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{p.label} <span className="font-mono text-brand-light">{p.ext}</span></p>
                <p className="text-xs text-white/40">{p.note}</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${targets[p.key] ? 'border-brand bg-brand' : 'border-white/20'}`}>
                {targets[p.key] && <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Window Dimensions */}
      <Section title="Window Size">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">Default Width</label>
            <input type="number" className="input" value={window.width} min={200} max={7680}
              onChange={(e) => onWindowChange({ width: parseInt(e.target.value) || 1280 })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">Default Height</label>
            <input type="number" className="input" value={window.height} min={200} max={4320}
              onChange={(e) => onWindowChange({ height: parseInt(e.target.value) || 800 })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">Min Width</label>
            <input type="number" className="input" value={window.minWidth} min={200}
              onChange={(e) => onWindowChange({ minWidth: parseInt(e.target.value) || 800 })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">Min Height</label>
            <input type="number" className="input" value={window.minHeight} min={200}
              onChange={(e) => onWindowChange({ minHeight: parseInt(e.target.value) || 600 })} />
          </div>
        </div>
      </Section>

      {/* Window Options */}
      <Section title="Window Options">
        <div className="space-y-3 divide-y divide-white/[0.04]">
          <ToggleRow id="resizable" label="Resizable" desc="User can resize the window" checked={window.resizable} onChange={(v) => onWindowChange({ resizable: v })} />
          <div className="pt-3"><ToggleRow id="fullscreenable" label="Allow Fullscreen" desc="User can enter fullscreen mode" checked={window.fullscreenable} onChange={(v) => onWindowChange({ fullscreenable: v })} /></div>
          <div className="pt-3"><ToggleRow id="frameless" label="Frameless Window" desc="Remove OS window title bar and borders" checked={window.frameless} onChange={(v) => onWindowChange({ frameless: v })} /></div>
          <div className="pt-3"><ToggleRow id="alwaysOnTop" label="Always On Top" desc="Window stays above all other windows" checked={window.alwaysOnTop} onChange={(v) => onWindowChange({ alwaysOnTop: v })} /></div>
        </div>
      </Section>

      {/* App Features */}
      <Section title="App Features">
        <div className="space-y-3 divide-y divide-white/[0.04]">
          <ToggleRow id="menuBar" label="Show Menu Bar" desc="Native application menu bar (File, Edit, View…)" checked={features.menuBar} onChange={(v) => onFeaturesChange({ menuBar: v })} />
          <div className="pt-3"><ToggleRow id="trayIcon" label="System Tray Icon" desc="App stays in system tray when window is closed" checked={features.trayIcon} onChange={(v) => onFeaturesChange({ trayIcon: v })} /></div>
          <div className="pt-3"><ToggleRow id="singleInstance" label="Single Instance" desc="Prevent multiple instances of the app running" checked={features.singleInstance} onChange={(v) => onFeaturesChange({ singleInstance: v })} /></div>
          <div className="pt-3"><ToggleRow id="contextMenu" label="Right-click Menu" desc="Copy, paste, reload, fullscreen context menu" checked={features.contextMenu} onChange={(v) => onFeaturesChange({ contextMenu: v })} /></div>
          <div className="pt-3"><ToggleRow id="devTools" label="Developer Tools" desc="Enable F12 to open Chrome DevTools" checked={features.devTools} onChange={(v) => onFeaturesChange({ devTools: v })} /></div>
          <div className="pt-3"><ToggleRow id="nativeNotifications" label="Native Notifications" desc="Allow the app to show system notifications" checked={features.nativeNotifications} onChange={(v) => onFeaturesChange({ nativeNotifications: v })} /></div>
        </div>
      </Section>
    </div>
  )
}
