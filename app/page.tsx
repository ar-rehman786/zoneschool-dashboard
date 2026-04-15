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
        <div className="text-5xl mb-5 opacity-40">{'\u{1F4E1}'}</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: C.text, fontFamily: 'Lexend, sans-serif' }}>No leads yet &mdash; waiting for data</h2>
        <p className="text-sm mb-6" style={{ color: C.textMuted }}>
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
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2B456D', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: C.textMuted }}>Loading dashboard...</p>
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
          <div className="p-6">
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
