'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { ThemeProvider, useTheme } from '@/lib/theme'
import { isJunkLead } from '@/lib/helpers'
import { Card } from './components/ui/Card'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { MobileHeader } from './components/MobileHeader'
import { TopProspects } from './components/views/TopProspects'
import { MarketIntelligence } from './components/views/MarketIntelligence'
import { YourMembers } from './components/views/YourMembers'
import { AllResponses } from './components/views/AllResponses'

type ViewId = 'prospects' | 'intelligence' | 'members' | 'all'

function EmptyState() {
  const t = useTheme()
  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <Card className="max-w-lg w-full text-center py-16 px-8">
        <div className="mb-5">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: t.textMuted, opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-xl mb-2" style={{ color: t.text, fontFamily: C.fontHeading, fontWeight: 600 }}>No leads yet &mdash; waiting for data</h2>
        <p className="mb-6" style={{ color: t.textMuted, fontFamily: C.fontBody, fontSize: '14px', lineHeight: '1.6' }}>
          Leads will appear here once form responses are analyzed by the n8n automation and written back to GoHighLevel.
        </p>
      </Card>
    </div>
  )
}

function LoadingScreen() {
  const t = useTheme()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.accent, borderTopColor: 'transparent' }} />
        <p style={{ color: t.textMuted, fontFamily: C.fontBody, fontSize: '14px' }}>Loading dashboard...</p>
      </div>
    </div>
  )
}

function DashboardContent({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const t = useTheme()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewId>('prospects')
  const [lastUpdated, setLastUpdated] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('Failed to fetch leads:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(fetchLeads, 10_000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  const realLeads = useMemo(() => leads.filter(l => !isJunkLead(l)), [leads])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen transition-colors duration-300" style={{ background: t.bg, overflow: 'hidden' }}>
      <Sidebar view={view} onView={setView} leads={realLeads} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto h-screen min-w-0">
        <MobileHeader lastUpdated={lastUpdated} onMenuClick={() => setSidebarOpen(true)} />

        {realLeads.length === 0 && leads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-4 lg:p-6 animate-view-enter" key={view}>
            <Header lastUpdated={lastUpdated} onToggleDark={() => setDarkMode(!darkMode)} />

            {view === 'prospects' && <TopProspects leads={realLeads} />}
            {view === 'intelligence' && <MarketIntelligence leads={realLeads} />}
            {view === 'members' && <YourMembers leads={realLeads} />}
            {view === 'all' && <AllResponses leads={leads} />}
          </div>
        )}
      </main>
    </div>
  )
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <ThemeProvider dark={darkMode}>
      <DashboardContent darkMode={darkMode} setDarkMode={setDarkMode} />
    </ThemeProvider>
  )
}
