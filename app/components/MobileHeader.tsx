'use client'

import { C } from '@/lib/constants'
import { useTheme } from '@/lib/theme'

export function MobileHeader({ lastUpdated, onMenuClick }: { lastUpdated: string; onMenuClick: () => void }) {
  const t = useTheme()
  return (
    <header
      className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4"
      style={{
        height: '56px',
        background: t.card,
        borderBottom: `1px solid ${t.cardBorder}`,
      }}
    >
      {/* Hamburger */}
      <button onClick={onMenuClick} className="p-1" aria-label="Open menu">
        <svg className="w-6 h-6" fill="none" stroke={t.text} viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo */}
      <div style={{ width: '120px', height: '40px', overflow: 'hidden' }}>
        <img
          src={t.isDark ? '/logos/logo-light-transparent.png' : '/logos/logo-dark-transparent.png'}
          alt="Mindful Body Productions"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
      </div>

      {/* Live dot + time */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#34D399' }} />
        <span style={{ fontSize: '11px', color: t.textMuted, fontFamily: C.fontBody }}>{lastUpdated}</span>
      </div>
    </header>
  )
}
