import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://stackforge.example.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'StackForge — Turn your web app into a desktop app',
  description: 'Upload a ZIP or connect GitHub. StackForge wraps your web project with Electron and gives you a native .exe, .dmg or .AppImage installer.',
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website', url: SITE_URL,
    title: 'StackForge — Turn your web app into a desktop app',
    description: 'Upload a ZIP or connect GitHub. Get a native desktop installer in minutes.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'StackForge' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StackForge — Web to Desktop App Converter',
    description: 'Upload your web project, configure settings, download a .exe installer.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication',
    name: 'StackForge', applicationCategory: 'DeveloperApplication', operatingSystem: 'Web',
    description: 'Convert web projects into native desktop applications',
    url: SITE_URL, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Script id="ld-json" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Analytics />
      </body>
    </html>
  )
}
