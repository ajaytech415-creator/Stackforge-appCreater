import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Image src="/logo.png" alt="StackForge" width={28} height={28} className="rounded-lg" />
              <span className="font-bold text-white">StackForge</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Convert your web projects into native desktop applications. Upload a ZIP or connect GitHub — get a .exe, .dmg or .AppImage.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/build" className="text-sm text-white/50 hover:text-white transition-colors">Build App</Link></li>
              <li><a href="#how" className="text-sm text-white/50 hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">Open Source</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">GitHub</a></li>
              <li><span className="text-sm text-white/50">MIT License</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/[0.06] pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} StackForge. Built with Next.js, TypeScript & Tailwind CSS.
        </div>
      </div>
    </footer>
  )
}
