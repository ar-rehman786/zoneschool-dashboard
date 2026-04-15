'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { Card } from './components/ui/Card'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { TopProspects } from './components/views/TopProspects'
import { MarketIntelligence } from './components/views/MarketIntelligence'
import { YourMembers } from './components/views/YourMembers'
import { AllResponses } from './components/views/AllResponses'

type ViewId = 'prospects' | 'intelligence' | 'members' | 'all'

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <Card className="max-w-lg w-full text-center py-16 px-8">
        <div className="mb-5">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: C.textMuted, opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-xl mb-2" style={{ color: C.text, fontFamily: C.fontHeading, fontWeight: 600 }}>No leads yet &mdash; waiting for data</h2>
        <p className="mb-6" style={{ color: C.textMuted, fontFamily: C.fontBody, fontSize: '14px', lineHeight: '1.6' }}>
          Leads will appear here once form responses are analyzed by the n8n automation and written back to GoHighLevel.
        </p>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewId>('prospects')
  const [lastUpdated, setLastUpdated] = useState('')

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.accent, borderTopColor: 'transparent' }} />
          <p style={{ color: C.textMuted, fontFamily: C.fontBody, fontSize: '14px' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: C.bg, overflow: 'hidden' }}>
      <Sidebar view={view} onView={setView} leads={leads} />

      <main className="flex-1 overflow-y-auto h-screen">
        {leads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-6" key={view}>
            <Header lastUpdated={lastUpdated} />

            {view === 'prospects' && <TopProspects leads={leads} />}
            {view === 'intelligence' && <MarketIntelligence leads={leads} />}
            {view === 'members' && <YourMembers leads={leads} />}
            {view === 'all' && <AllResponses leads={leads} />}
          </div>
        )}
      </main>
    </div>
  )
}
