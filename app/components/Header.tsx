'use client'

import { C } from '@/lib/constants'

export function Header({ lastUpdated }: { lastUpdated: string }) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl tracking-tight" style={{ color: C.text, fontFamily: C.fontHeading, fontWeight: 700 }}>ZoneSchool Market Intelligence</h1>
        <p className="mt-1" style={{ color: C.textMuted, fontFamily: C.fontBody, fontSize: '14px' }}>Zone Technique &middot; Lead Analysis &amp; Strategic Insights for Dr. Peter Goldman</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#34D399' }} />
          <span style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontBody }}>Live &middot; {lastUpdated}</span>
        </div>
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
