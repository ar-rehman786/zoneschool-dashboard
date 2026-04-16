'use client'

import { C } from '@/lib/constants'
import { useTheme } from '@/lib/theme'

export function Header({ lastUpdated, onToggleDark }: { lastUpdated: string; onToggleDark: () => void }) {
  const t = useTheme()
  return (
    <header className="hidden lg:flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl tracking-tight" style={{ color: t.text, fontFamily: C.fontHeading, fontWeight: 700 }}>ZoneSchool Market Intelligence</h1>
        <p className="mt-1" style={{ color: t.textMuted, fontFamily: C.fontBody, fontSize: '14px' }}>Zone Technique &middot; Lead Analysis &amp; Strategic Insights for Dr. Peter Goldman</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#34D399' }} />
          <span style={{ fontSize: '12px', color: t.textMuted, fontFamily: C.fontBody }}>Live &middot; {lastUpdated}</span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
          style={{
            background: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(30,36,48,0.04)',
            border: `1px solid ${t.cardBorder}`,
          }}
          aria-label={t.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {t.isDark ? (
            /* Sun icon */
            <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke={C.accent} viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="12" cy="12" r="5" />
              <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            /* Moon icon */
            <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke={t.textMuted} viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm rounded-xl transition-all duration-200"
          style={{
            fontFamily: C.fontHeading,
            fontWeight: 600,
            background: 'transparent',
            color: C.accent,
            border: `1.5px solid ${C.accent}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = '#FFFFFF' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.accent }}
        >
          Export PDF
        </button>
      </div>
    </header>
  )
}
