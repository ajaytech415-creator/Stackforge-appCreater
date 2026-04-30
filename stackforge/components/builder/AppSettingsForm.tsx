'use client'
import { useRef } from 'react'
import Image from 'next/image'
import type { AppConfig } from '@/types'
import { slugifyAppId } from '@/types'

interface Props {
  app: AppConfig
  logoPreview: string | null
  onChange: (patch: Partial<AppConfig>) => void
  onLogoSelect: (f: File, preview: string) => void
  onLogoClear: () => void
}

export function AppSettingsForm({ app, logoPreview, onChange, onLogoSelect, onLogoClear }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onLogoSelect(file, ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleNameChange = (name: string) => {
    onChange({ appName: name, appId: slugifyAppId(name) })
  }

  return (
    <div className="space-y-5">
      {/* Logo upload */}
      <div className="glass-card rounded-xl p-5">
        <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-white/40">App Icon</label>
        <div className="flex items-center gap-5">
          <div
            onClick={() => logoRef.current?.click()}
            className="relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] transition-all hover:border-white/20 hover:bg-white/[0.04] overflow-hidden"
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="App icon" width={96} height={96} className="h-full w-full object-cover rounded-2xl" unoptimized />
            ) : (
              <svg className="h-8 w-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            )}
            <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleLogoInput} />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-white/80">Upload App Icon</p>
            <p className="text-xs text-white/40">PNG, JPG or WebP · Recommended 512×512 px</p>
            <p className="text-xs text-white/30">Used as the application icon on Windows, macOS and Linux</p>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => logoRef.current?.click()} className="btn text-xs border border-white/10 text-white/60 hover:text-white px-3 py-1.5">
                {logoPreview ? 'Change' : 'Browse'}
              </button>
              {logoPreview && (
                <button type="button" onClick={onLogoClear} className="btn text-xs border border-red-500/20 text-red-400 hover:bg-red-500/5 px-3 py-1.5">Remove</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* App details */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">App Details</label>
        <div className="grid gap-4">
          <div>
            <label htmlFor="app-name" className="mb-1.5 block text-sm font-medium text-white/80">App Name <span className="text-red-400">*</span></label>
            <input id="app-name" className="input" value={app.appName} onChange={(e) => handleNameChange(e.target.value)} placeholder="My Desktop App" />
          </div>
          <div>
            <label htmlFor="app-id" className="mb-1.5 block text-sm font-medium text-white/80">App ID</label>
            <input id="app-id" className="input font-mono text-sm" value={app.appId} onChange={(e) => onChange({ appId: e.target.value })} placeholder="com.company.appname" />
            <p className="mt-1 text-xs text-white/30">Unique identifier in reverse domain format</p>
          </div>
          <div>
            <label htmlFor="app-desc" className="mb-1.5 block text-sm font-medium text-white/80">Description</label>
            <textarea id="app-desc" className="input min-h-[72px] resize-none" value={app.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="A brief description of your app…" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="app-version" className="mb-1.5 block text-sm font-medium text-white/80">Version</label>
              <input id="app-version" className="input" value={app.version} onChange={(e) => onChange({ version: e.target.value })} placeholder="1.0.0" />
            </div>
            <div>
              <label htmlFor="app-copyright" className="mb-1.5 block text-sm font-medium text-white/80">Copyright</label>
              <input id="app-copyright" className="input" value={app.copyright} onChange={(e) => onChange({ copyright: e.target.value })} placeholder={`© ${new Date().getFullYear()}`} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="app-author" className="mb-1.5 block text-sm font-medium text-white/80">Author Name</label>
              <input id="app-author" className="input" value={app.authorName} onChange={(e) => onChange({ authorName: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="app-email" className="mb-1.5 block text-sm font-medium text-white/80">Author Email</label>
              <input id="app-email" type="email" className="input" value={app.authorEmail} onChange={(e) => onChange({ authorEmail: e.target.value })} placeholder="you@example.com" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
