'use client'

import { C } from '@/lib/constants'
import type { Lead } from '@/lib/types'

type ViewId = 'prospects' | 'intelligence' | 'members' | 'all'

export function Sidebar({ view, onView, leads }: { view: string; onView: (v: ViewId) => void; leads: Lead[] }) {
  const total = leads.length
  const prospects = leads.filter(l => !l.is_active_client).length
  const members = leads.filter(l => l.is_active_client).length

  const nav = (id: ViewId, icon: React.ReactNode, label: string, count?: number) => {
    const isActive = view === id
    return (
      <button
        key={id}
        onClick={() => onView(id)}
        className="w-full text-left px-4 py-2.5 text-sm transition-all duration-200 flex items-center justify-between"
        style={{
          fontFamily: C.fontHeading,
          fontWeight: isActive ? 600 : 500,
          borderRadius: '8px',
          borderLeft: isActive ? `3px solid ${C.sidebarActive}` : '3px solid transparent',
          background: isActive ? 'rgba(216,192,122,0.12)' : 'transparent',
          color: isActive ? '#FFFFFF' : C.sidebarText,
          transition: 'all 200ms ease',
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#FFFFFF' } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.sidebarText } }}
      >
        <span className="flex items-center gap-2.5">
          {icon}
          {label}
        </span>
        {count !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-md"
            style={{
              fontFamily: C.fontHeading,
              fontWeight: 600,
              background: isActive ? 'rgba(216,192,122,0.2)' : 'rgba(255,255,255,0.08)',
              color: isActive ? C.sidebarActive : 'rgba(255,255,255,0.5)',
            }}>
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className="w-[280px] flex flex-col h-screen sticky top-0 shrink-0 overflow-y-auto"
      style={{ background: C.sidebarBg }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <img
          src="https://storage.googleapis.com/msgsndr/jiWMvGMc0XJqF7AqrvIu/media/66e2d5e200578a50d19d13ff.webp"
          alt="ZoneSchool"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      <div className="p-3 space-y-6 flex-1">
        <div className="space-y-1">
          <p className="uppercase px-4 mb-2" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: C.fontHeading, fontWeight: 600, letterSpacing: '0.08em' }}>Intelligence</p>
          {nav('prospects',
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
            'Top Prospects', prospects
          )}
          {nav('intelligence',
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
            'Market Intelligence'
          )}
        </div>

        <div className="space-y-1">
          <p className="uppercase px-4 mb-2" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: C.fontHeading, fontWeight: 600, letterSpacing: '0.08em' }}>People</p>
          {nav('members',
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
            'Your Members', members
          )}
          {nav('all',
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
            'All Responses', total
          )}
        </div>
      </div>

      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: C.fontBody }}>Dr. Peter Goldman &middot; Zone Technique</p>
      </div>
    </aside>
  )
}
