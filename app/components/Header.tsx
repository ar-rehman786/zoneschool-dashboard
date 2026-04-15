'use client'

import { C } from '@/lib/constants'

export function Header({ lastUpdated }: { lastUpdated: string }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: C.text, fontFamily: 'Lexend, sans-serif' }}>ZoneSchool Market Intelligence</h1>
        <p className="text-sm mt-0.5" style={{ color: C.textDim }}>Zone Technique · Lead Analysis & Strategic Insights for Dr. Peter Goldman</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span className="text-[11px]" style={{ color: C.textDim }}>Live · {lastUpdated}</span>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-white text-sm font-semibold rounded-xl transition-colors"
          style={{ background: '#2B456D', boxShadow: '0 4px 12px rgba(43,69,109,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1E3555' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#2B456D' }}
        >
          Export PDF
        </button>
      </div>
    </header>
  )
}
