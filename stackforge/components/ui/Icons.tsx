/**
 * Premium gradient SVG icons — purple-to-cyan matching the StackForge design language.
 * Each icon uses a shared gradient definition for consistency.
 */

const GRADIENT_ID_PREFIX = 'sf-grad-'
let gradCounter = 0
function useGradId() { return `${GRADIENT_ID_PREFIX}${gradCounter++}` }

interface IconProps { className?: string; size?: number }

function GradientDef({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="50%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
  )
}

export function IconUpload({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-upload'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 8 12 3 7 8" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="3" x2="12" y2="15" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconDownload({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-download'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="7 10 12 15 17 10" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="15" x2="12" y2="3" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconMonitor({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-monitor'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <rect x="2" y="3" width="20" height="14" rx="2" stroke={`url(#${id})`} strokeWidth="2"/>
      <line x1="8" y1="21" x2="16" y2="21" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconShield({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-shield'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9 12 11 14 15 10" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconCube({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-cube'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="22.08" x2="12" y2="12" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBolt({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-bolt'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconSettings({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-settings'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <circle cx="12" cy="12" r="3" stroke={`url(#${id})`} strokeWidth="2"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconImage({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-image'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={`url(#${id})`} strokeWidth="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" stroke={`url(#${id})`} strokeWidth="2"/>
      <polyline points="21 15 16 10 5 21" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconWindows({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-win'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <path d="M3 5.5L10 4.5V11.5H3V5.5Z" stroke={`url(#${id})`} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 4.5L21 3V11.5H10V4.5Z" stroke={`url(#${id})`} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M3 12.5H10V19.5L3 18.5V12.5Z" stroke={`url(#${id})`} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 12.5H21V21L10 19.5V12.5Z" stroke={`url(#${id})`} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconApple({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-apple'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <path d="M12 2C13.1 2 14 2.9 14 4C14 2.9 14.9 2 16 2C16 3.1 15.1 4 14 4H12C10.9 4 10 3.1 10 2C11.1 2 12 2.9 12 2Z" stroke={`url(#${id})`} strokeWidth="1.5"/>
      <path d="M17 8C19.2 8 21 10 21 12.5C21 17 17 22 14.5 22C13.5 22 13 21.5 12 21.5C11 21.5 10.5 22 9.5 22C7 22 3 17 3 12.5C3 10 4.8 8 7 8C8.5 8 9.5 8.8 10 9C10.5 9.2 11 9 12 9C13 9 13.5 9.2 14 9C14.5 8.8 15.5 8 17 8Z" stroke={`url(#${id})`} strokeWidth="1.5"/>
    </svg>
  )
}

export function IconLinux({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-linux'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <path d="M12 2C8.7 2 6 5.6 6 10C6 12.3 5 14 4 16C3 18 4 20 7 20C8 20 9 19.5 10 19.2C10.6 19.1 11.3 19 12 19C12.7 19 13.4 19.1 14 19.2C15 19.5 16 20 17 20C20 20 21 18 20 16C19 14 18 12.3 18 10C18 5.6 15.3 2 12 2Z" stroke={`url(#${id})`} strokeWidth="1.5"/>
      <circle cx="9.5" cy="9" r="1" fill={`url(#${id})`}/>
      <circle cx="14.5" cy="9" r="1" fill={`url(#${id})`}/>
      <path d="M10 13C10.8 13.6 11.4 14 12 14C12.6 14 13.2 13.6 14 13" stroke={`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBell({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-bell'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconLayers({ className = 'h-6 w-6', size }: IconProps) {
  const id = 'grad-layers'
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <GradientDef id={id} />
      <polygon points="12 2 2 7 12 12 22 7 12 2" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="2 17 12 22 22 17" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="2 12 12 17 22 12" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconArrowRight({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

export function IconCheck({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
