import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  IconUpload, IconSettings, IconDownload,
  IconWindows, IconApple, IconLinux,
  IconImage, IconCube, IconBolt, IconShield,
  IconArrowRight,
} from '@/components/ui/Icons'

const STEPS = [
  { Icon: IconUpload, title: 'Upload your project', desc: 'Drop a ZIP of your web app or connect GitHub and pick a repo.' },
  { Icon: IconSettings, title: 'Configure your app', desc: 'Set app name, icon, window size and platform features.' },
  { Icon: IconDownload, title: 'Download installer', desc: 'Get a native .exe, .dmg or .AppImage ready to distribute.' },
]

const FEATURES = [
  { Icon: IconWindows, title: 'Windows (.exe)', desc: 'NSIS installer with Start Menu and Desktop shortcuts.' },
  { Icon: IconApple, title: 'macOS (.dmg)', desc: 'Drag-to-Applications disk image for Mac users.' },
  { Icon: IconLinux, title: 'Linux (.AppImage)', desc: 'Portable AppImage that runs on any Linux distro.' },
  { Icon: IconImage, title: 'Custom App Icon', desc: 'Upload your PNG logo — auto-converted for all platforms.' },
  { Icon: IconCube, title: 'Window Control', desc: 'Set dimensions, frameless mode, always-on-top, and more.' },
  { Icon: IconBolt, title: 'Tray + Notifications', desc: 'System tray icon and native notification support.' },
]

export default function HomePage() {
  return (
    <div className="relative">
      {/* Glow backgrounds */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-accent-cyan/5 blur-[80px]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-medium text-brand-light mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
            Powered by Electron + electron-builder
          </span>
        </div>
        <h1 className="animate-fade-up delay-100 text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
          <span className="gradient-text-hero">Turn your web app</span>
          <br />
          <span className="text-white">into a desktop app.</span>
        </h1>
        <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
          Upload a ZIP of your web project or connect GitHub. StackForge wraps it with Electron
          and gives you a native Windows, macOS or Linux installer — no setup required.
        </p>
        <div className="animate-fade-up delay-300 mt-10 flex items-center justify-center gap-4">
          <Link href="/build">
            <Button className="text-base px-8 py-3 animate-pulse-glow">
              Start Building
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#how">
            <Button variant="ghost" className="text-base px-6 py-3 border border-white/10">How it works</Button>
          </a>
        </div>

        {/* Platform icons floating */}
        <div className="animate-fade-up delay-400 mt-14 flex items-center justify-center gap-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md animate-float glow-sm">
            <IconWindows className="h-8 w-8" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md animate-float glow-sm" style={{ animationDelay: '0.5s' }}>
            <IconApple className="h-8 w-8" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md animate-float glow-sm" style={{ animationDelay: '1s' }}>
            <IconLinux className="h-8 w-8" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-white mb-10">3 steps to a desktop app</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={i} className="card hover:border-brand/20 hover:bg-white/[0.05] hover:scale-[1.02] transition-all duration-300 text-center group">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 group-hover:bg-brand/15 transition-colors border border-brand/10">
                <s.Icon className="h-7 w-7" />
              </div>
              <div className="mb-1.5 text-xs font-bold text-accent-cyan uppercase tracking-widest">Step {i + 1}</div>
              <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-center text-2xl font-bold text-white mb-10">Everything included</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card hover:border-brand/20 hover:bg-white/[0.05] hover:scale-[1.02] transition-all duration-300 group">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 group-hover:bg-brand/15 transition-colors border border-brand/10">
                <f.Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <div className="inline-block glass-card rounded-2xl border border-brand/20 px-10 py-8 glow-sm">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-icon">
                <IconShield className="h-7 w-7" />
              </div>
            </div>
            <p className="text-xl font-bold text-white mb-2">Ready to ship?</p>
            <p className="text-sm text-white/50 mb-6">Upload your project and download a desktop installer in minutes.</p>
            <Link href="/build">
              <Button className="text-base px-8 py-3">
                <IconBolt className="mr-2 h-4 w-4" />
                Build Your Desktop App
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
