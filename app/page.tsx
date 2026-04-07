'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface Lead {
  id: string
  urgency_level: 'Hot' | 'Warm' | 'Cold'
  sentiment_score: number
  problem_description: string
  bottlenecks: string
  fears: string
  desires: string
  lead_summary: string
  timestamp: string
  name: string
  email: string
  market_readiness: 'Done-For-You' | 'DIY' | 'Hybrid'
  past_investment: string
  tried_before: string
  success_definition: string
  identity_transformation: string
  service_preference: string
  key_phrase: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Colors — MBP Light Theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const C = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: 'rgba(43,69,109,0.08)',
  cardShadow: '0 10px 25px -5px rgba(43,69,109,0.05)',
  text: '#1E293B',
  textMuted: '#64748B',
  textDim: '#94A3B8',
  hot: '#DC2626',
  warm: '#F59E0B',
  cold: '#2B456D',
  accent: '#2B456D',
  sage: '#8BA892',
  mauve: '#A6809F',
  hotBg: '#FEE2E2',
  warmBg: '#FEF3C7',
  coldBg: '#E0E7FF',
  hotBorder: '#FECACA',
  warmBorder: '#FDE68A',
  coldBorder: '#C7D2FE',
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function splitPhrases(text: string): string[] {
  return text.split(/[;\n]/).map(s => s.trim()).filter(Boolean)
}

function collectUnique(leads: Lead[], field: keyof Lead): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  leads.forEach(l => {
    splitPhrases(String(l[field])).forEach(p => {
      const k = p.toLowerCase()
      if (!seen.has(k)) { seen.add(k); result.push(p) }
    })
  })
  return result
}

function countPhrases(leads: Lead[], field: keyof Lead): Array<{ text: string; count: number }> {
  const map: Record<string, number> = {}
  leads.forEach(l => {
    splitPhrases(String(l[field])).forEach(p => { map[p] = (map[p] || 0) + 1 })
  })
  return Object.entries(map)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
}

function pct(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0
}

function fmtDate(ts: string): string {
  try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return ts }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Urgency badge
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function UrgencyBadge({ level }: { level: string }) {
  const cfg: Record<string, { bg: string; text: string; border: string }> = {
    Hot: { bg: C.hotBg, text: C.hot, border: C.hotBorder },
    Warm: { bg: C.warmBg, text: '#B45309', border: C.warmBorder },
    Cold: { bg: C.coldBg, text: C.cold, border: C.coldBorder },
  }
  const icons: Record<string, string> = { Hot: '🔥', Warm: '⚡', Cold: '❄️' }
  const c = cfg[level] || cfg.Cold
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {icons[level]} {level}
    </span>
  )
}

function MarketReadinessBadge({ readiness }: { readiness: string }) {
  const cfg: Record<string, { bg: string; text: string; border: string; label: string }> = {
    'Done-For-You': { bg: '#E0E7FF', text: '#2B456D', border: '#C7D2FE', label: 'DFY' },
    'DIY': { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9', label: 'DIY' },
    'Hybrid': { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', label: 'Hybrid' },
  }
  const c = cfg[readiness] || cfg['Hybrid']
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {c.label}
    </span>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sentiment bar
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SentimentBar({ score }: { score: number }) {
  const color = score >= 7 ? C.hot : score >= 4 ? C.warm : C.cold
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score * 10}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}/10</span>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Card wrapper — bento-card style
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={{ border: `1px solid ${C.cardBorder}`, boxShadow: C.cardShadow }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold mb-4" style={{ color: C.text, fontFamily: 'Lexend, sans-serif' }}>{children}</h2>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMPTY STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <Card className="max-w-lg w-full text-center py-16 px-8">
        <div className="text-5xl mb-5 opacity-40">📡</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: C.text, fontFamily: 'Lexend, sans-serif' }}>No leads yet — waiting for N8N webhook data</h2>
        <p className="text-sm mb-6" style={{ color: C.textMuted }}>
          Send a POST to <code className="px-2 py-0.5 rounded text-xs font-mono" style={{ background: '#F1F5F9', color: C.accent }}>/api/leads</code> from your N8N workflow
        </p>
        <div className="rounded-xl p-4 text-left" style={{ background: '#F1F5F9' }}>
          <p className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: C.textDim }}>Expected JSON Structure</p>
          <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto" style={{ color: C.textMuted }}>{`{
  "urgency_level": "Hot" | "Warm" | "Cold",
  "sentiment_score": 1-10,
  "problem_description": "string",
  "bottlenecks": "string",
  "fears": "string",
  "desires": "string",
  "lead_summary": "string",
  "timestamp": "ISO date string",
  "name": "string",
  "email": "string",
  "market_readiness": "Done-For-You" | "DIY" | "Hybrid",
  "past_investment": "string",
  "tried_before": "string",
  "success_definition": "string",
  "identity_transformation": "string",
  "service_preference": "string",
  "key_phrase": "string"
}`}</pre>
        </div>
      </Card>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIDEBAR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Sidebar({ view, onView, leads }: { view: string; onView: (v: string) => void; leads: Lead[] }) {
  const total = leads.length
  const hot = leads.filter(l => l.urgency_level === 'Hot').length
  const warm = leads.filter(l => l.urgency_level === 'Warm').length
  const cold = leads.filter(l => l.urgency_level === 'Cold').length

  const nav = (id: string, label: string, count?: number) => (
    <button
      key={id}
      onClick={() => onView(id)}
      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between"
      style={
        view === id
          ? { background: '#2B456D', color: 'white', boxShadow: '0 4px 12px rgba(43,69,109,0.2)' }
          : { color: C.textMuted }
      }
      onMouseEnter={e => { if (view !== id) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#2B456D' } }}
      onMouseLeave={e => { if (view !== id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textMuted } }}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="text-xs px-1.5 py-0.5 rounded-md font-mono"
          style={view === id ? { background: 'rgba(255,255,255,0.2)' } : { background: '#F1F5F9' }}>
          {count}
        </span>
      )}
    </button>
  )

  return (
    <aside className="w-[280px] bg-white flex flex-col h-screen sticky top-0 shrink-0 overflow-y-auto"
      style={{ borderRight: `1px solid ${C.cardBorder}` }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
        <img
          src="https://storage.googleapis.com/msgsndr/jiWMvGMc0XJqF7AqrvIu/media/66e2d5e200578a50d19d13ff.webp"
          alt="ZoneSchool"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      <div className="p-3 space-y-5 flex-1">
        <div className="space-y-1">
          <p className="uppercase px-3 mb-1.5" style={{ fontSize: '0.7rem', color: C.textMuted, fontWeight: 700, letterSpacing: '0.05rem' }}>Dashboard</p>
          {nav('overview', '📊 Market Intelligence')}
        </div>

        <div className="space-y-1">
          <p className="uppercase px-3 mb-1.5" style={{ fontSize: '0.7rem', color: C.textMuted, fontWeight: 700, letterSpacing: '0.05rem' }}>Lead Segments</p>
          {nav('all', '👥 All Respondents', total)}
          {nav('hot', '🔥 Hot Leads', hot)}
          {nav('warm', '⚡ Warm Leads', warm)}
          {nav('cold', '❄️ Cold Leads', cold)}
        </div>

        <div className="space-y-1">
          <p className="uppercase px-3 mb-1.5" style={{ fontSize: '0.7rem', color: C.textMuted, fontWeight: 700, letterSpacing: '0.05rem' }}>By Readiness</p>
          {nav('readiness', '📋 By Readiness')}
        </div>
      </div>

      <div className="p-4" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
        <p className="text-[10px]" style={{ color: C.textDim }}>Dr. Peter Goldman · Zone Technique</p>
      </div>
    </aside>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEADER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Header({ lastUpdated }: { lastUpdated: string }) {
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 1: OVERVIEW PANEL (stat cards)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function OverviewCards({ leads }: { leads: Lead[] }) {
  const total = leads.length
  const hot = leads.filter(l => l.urgency_level === 'Hot').length
  const warm = leads.filter(l => l.urgency_level === 'Warm').length
  const cold = leads.filter(l => l.urgency_level === 'Cold').length
  const avg = total > 0 ? (leads.reduce((s, l) => s + l.sentiment_score, 0) / total).toFixed(1) : '—'

  const cards = [
    { label: 'Total Respondents', value: String(total), sub: 'Zone Technique Leads', color: C.accent, icon: '👥' },
    { label: 'Hot Leads', value: String(hot), sub: `${pct(hot, total)}% of total`, color: C.hot, icon: '🔥' },
    { label: 'Warm Leads', value: String(warm), sub: `${pct(warm, total)}% of total`, color: C.warm, icon: '⚡' },
    { label: 'Cold Leads', value: String(cold), sub: `${pct(cold, total)}% of total`, color: C.cold, icon: '❄️' },
    { label: 'Avg Sentiment', value: avg, sub: 'out of 10', color: C.sage, icon: '📊' },
  ]

  const dfy = leads.filter(l => l.market_readiness === 'Done-For-You').length
  const diy = leads.filter(l => l.market_readiness === 'DIY').length
  const hybrid = leads.filter(l => l.market_readiness === 'Hybrid').length

  return (
    <>
      <div className="grid grid-cols-5 gap-3 mb-3">
        {cards.map(c => (
          <Card key={c.label} className="relative overflow-hidden">
            <p className="uppercase tracking-wider font-bold mb-1" style={{ fontSize: '0.75rem', color: C.textMuted, letterSpacing: '0.05em' }}>{c.label}</p>
            <p className="leading-none mt-1" style={{ fontSize: '2.2rem', fontWeight: 700, color: c.color, fontFamily: 'Lexend, sans-serif' }}>{c.value}</p>
            <p className="text-xs mt-1" style={{ color: C.textMuted }}>{c.sub}</p>
            <span className="absolute right-3 bottom-2 text-3xl opacity-[0.07]">{c.icon}</span>
          </Card>
        ))}
      </div>
      <Card className="mb-6 relative overflow-hidden">
        <p className="uppercase tracking-wider font-bold mb-3" style={{ fontSize: '0.75rem', color: C.textMuted, letterSpacing: '0.05em' }}>Market Readiness Breakdown</p>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: '#2B456D' }} />
            <span className="text-sm" style={{ color: C.textMuted }}>Done-For-You:</span>
            <span className="font-bold" style={{ fontSize: '2.2rem', color: '#2B456D', fontFamily: 'Lexend, sans-serif' }}>{dfy}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: '#2E7D32' }} />
            <span className="text-sm" style={{ color: C.textMuted }}>DIY:</span>
            <span className="font-bold" style={{ fontSize: '2.2rem', color: '#2E7D32', fontFamily: 'Lexend, sans-serif' }}>{diy}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
            <span className="text-sm" style={{ color: C.textMuted }}>Hybrid:</span>
            <span className="font-bold" style={{ fontSize: '2.2rem', color: '#B45309', fontFamily: 'Lexend, sans-serif' }}>{hybrid}</span>
          </div>
        </div>
        <span className="absolute right-3 bottom-2 text-3xl opacity-[0.07]">📋</span>
      </Card>
    </>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 2: URGENCY CHART
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function UrgencyChart({ leads }: { leads: Lead[] }) {
  const total = leads.length
  const hot = leads.filter(l => l.urgency_level === 'Hot').length
  const warm = leads.filter(l => l.urgency_level === 'Warm').length
  const cold = leads.filter(l => l.urgency_level === 'Cold').length

  const data = [
    { name: 'Hot', count: hot, pct: pct(hot, total), fill: C.hot },
    { name: 'Warm', count: warm, pct: pct(warm, total), fill: C.warm },
    { name: 'Cold', count: cold, pct: pct(cold, total), fill: C.cold },
  ]

  return (
    <Card className="mb-6">
      <SectionTitle>Timeline Urgency Breakdown</SectionTitle>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: C.text, fontWeight: 600 }} axisLine={false} tickLine={false} width={55} />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(43,69,109,0.1)', borderRadius: '12px', color: C.text, fontSize: '13px' }}
              cursor={{ fill: 'rgba(43,69,109,0.04)' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, _: any, p: any) => [`${v} leads (${p?.payload?.pct ?? 0}%)`, '']}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-2 mt-3">
        {data.map(d => (
          <span key={d.name} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${d.fill}15`, color: d.fill }}>
            {d.name}: {d.count} ({d.pct}%)
          </span>
        ))}
      </div>
    </Card>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 2B: MARKET READINESS CHART
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MarketReadinessChart({ leads }: { leads: Lead[] }) {
  const total = leads.length
  const dfy = leads.filter(l => l.market_readiness === 'Done-For-You').length
  const diy = leads.filter(l => l.market_readiness === 'DIY').length
  const hybrid = leads.filter(l => l.market_readiness === 'Hybrid').length

  const data = [
    { name: 'Done-For-You', count: dfy, pct: pct(dfy, total), fill: '#2B456D' },
    { name: 'DIY', count: diy, pct: pct(diy, total), fill: '#2E7D32' },
    { name: 'Hybrid', count: hybrid, pct: pct(hybrid, total), fill: '#F59E0B' },
  ]

  return (
    <Card className="mb-6">
      <SectionTitle>Market Readiness Breakdown</SectionTitle>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: C.text, fontWeight: 600 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(43,69,109,0.1)', borderRadius: '12px', color: C.text, fontSize: '13px' }}
              cursor={{ fill: 'rgba(43,69,109,0.04)' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, _: any, p: any) => [`${v} leads (${p?.payload?.pct ?? 0}%)`, '']}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-2 mt-3">
        {data.map(d => (
          <span key={d.name} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${d.fill}15`, color: d.fill }}>
            {d.name}: {d.count} ({d.pct}%)
          </span>
        ))}
      </div>
    </Card>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 3: MARKET FIT LANGUAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MarketFitLanguage({ leads }: { leads: Lead[] }) {
  const problems = collectUnique(leads, 'problem_description')
  const bottlenecks = collectUnique(leads, 'bottlenecks')
  const fears = collectUnique(leads, 'fears')
  const desires = collectUnique(leads, 'desires')

  const successDefs = collectUnique(leads, 'success_definition')
  const servicePrefs = collectUnique(leads, 'service_preference')

  const boxes = [
    { title: 'How They Describe The Problem', items: problems, color: '#DC2626', border: 'border-l-red-600' },
    { title: 'Bottlenecks They Face', items: bottlenecks, color: '#F59E0B', border: 'border-l-amber-500' },
    { title: 'What They Fear', items: fears, color: '#A6809F', border: 'border-l-[#A6809F]' },
    { title: 'What They Are Looking For', items: desires, color: '#8BA892', border: 'border-l-[#8BA892]' },
    { title: 'How They Define Success', items: successDefs, color: '#06b6d4', border: 'border-l-cyan-500' },
    { title: 'Service Preference', items: servicePrefs, color: '#7C3AED', border: 'border-l-violet-600' },
  ]

  return (
    <div className="mb-6">
      <SectionTitle>Market Fit Language (Voice of Customer)</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {boxes.map(b => (
          <Card key={b.title} className={`border-l-4 ${b.border}`}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: b.color }}>{b.title}</p>
            {b.items.length === 0 ? (
              <p className="text-sm italic" style={{ color: C.textDim }}>No data yet</p>
            ) : (
              <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {b.items.slice(0, 12).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: C.text }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#A6809F' }} />
                    &ldquo;{item}&rdquo;
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 3B: KEY PHRASES WALL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function KeyPhrasesWall({ leads }: { leads: Lead[] }) {
  const phrases = leads.filter(l => l.key_phrase).map(l => ({ phrase: l.key_phrase, name: l.name }))

  return (
    <div className="mb-6">
      <SectionTitle>{'💬 Key Phrases — Voice of the Doctor'}</SectionTitle>
      {phrases.length === 0 ? (
        <Card><p className="text-sm text-center py-6" style={{ color: C.textDim }}>No key phrases extracted yet.</p></Card>
      ) : (
        <div className="flex flex-wrap gap-3">
          {phrases.map((p, i) => (
            <div key={i} className="rounded-xl p-4 border-l-4"
              style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}`, borderLeftWidth: '4px', borderLeftColor: '#2B456D' }}>
              <p className="text-sm italic" style={{ color: C.text }}>&ldquo;{p.phrase}&rdquo;</p>
              <p className="text-xs mt-2" style={{ color: C.textMuted }}>{p.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 4: LEAD SEGMENTS (tabbed)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function LeadSegments({ leads }: { leads: Lead[] }) {
  const [tab, setTab] = useState<'Hot' | 'Warm' | 'Cold'>('Hot')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = leads.filter(l => l.urgency_level === tab)
  const tabs: Array<{ key: 'Hot' | 'Warm' | 'Cold'; color: string; icon: string }> = [
    { key: 'Hot', color: C.hot, icon: '🔥' },
    { key: 'Warm', color: C.warm, icon: '⚡' },
    { key: 'Cold', color: C.cold, icon: '❄️' },
  ]

  return (
    <div className="mb-6">
      <SectionTitle>Lead Segments</SectionTitle>
      <div className="flex gap-1 mb-4" style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setExpandedId(null) }}
            className="px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors"
            style={tab === t.key
              ? { borderBottomColor: t.color, color: t.color }
              : { borderBottomColor: 'transparent', color: C.textDim }
            }
          >
            {t.icon} {t.key} Leads ({leads.filter(l => l.urgency_level === t.key).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-10">
          <p style={{ color: C.textDim }}>No {tab.toLowerCase()} leads yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <Card key={lead.id}>
              <button
                onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E0E7FF' }}>
                      <span className="text-xs font-bold" style={{ color: C.accent }}>{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.text }}>{lead.name}</p>
                      <p className="text-xs" style={{ color: C.textDim }}>{lead.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UrgencyBadge level={lead.urgency_level} />
                    <MarketReadinessBadge readiness={lead.market_readiness} />
                    <span className="text-xs" style={{ color: C.textDim }}>{fmtDate(lead.timestamp)}</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} style={{ color: C.textDim }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mb-2 max-w-xs"><SentimentBar score={lead.sentiment_score} /></div>
                <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{lead.lead_summary}</p>
              </button>

              {expandedId === lead.id && (
                <div className="mt-4 pt-4 grid grid-cols-2 gap-4 animate-fade-up" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                  <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                  <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                  <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                  <ExpandBlock label="Desires" text={lead.desires} color="#8BA892" />
                  {lead.key_phrase && <ExpandBlock label="Key Phrase" text={lead.key_phrase} color="#2B456D" />}
                  <ExpandBlock label="Identity Transformation" text={lead.identity_transformation} color="#8BA892" />
                  <ExpandBlock label="Past Investment" text={lead.past_investment} color="#F59E0B" />
                  <ExpandBlock label="Wants to be Served" text={lead.service_preference} color="#7C3AED" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ExpandBlock({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}` }}>
      <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color }}>{label}</p>
      <p className="text-xs leading-relaxed" style={{ color: C.text }}>{text || '—'}</p>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 5: ALL RESPONDENTS TABLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AllRespondents({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.lead_summary.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>All Respondents</SectionTitle>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textDim }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-xl w-64 transition-all focus:outline-none focus:ring-2"
            style={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, color: C.text, boxShadow: C.cardShadow }}
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
              {['Name', 'Email', 'Urgency', 'Readiness', 'Sentiment', 'Summary', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 uppercase tracking-widest font-bold" style={{ fontSize: '0.7rem', color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center" style={{ color: C.textDim }}>No respondents found.</td></tr>
            ) : (
              filtered.map(lead => (
                <Fragment key={lead.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    className="cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                    style={{ borderBottom: `1px solid ${C.cardBorder}` }}
                  >
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: C.text }}>{lead.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.textMuted }}>{lead.email || '—'}</td>
                    <td className="px-4 py-3"><UrgencyBadge level={lead.urgency_level} /></td>
                    <td className="px-4 py-3"><MarketReadinessBadge readiness={lead.market_readiness} /></td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold" style={{ color: lead.sentiment_score >= 7 ? C.hot : lead.sentiment_score >= 4 ? C.warm : C.cold }}>
                        {lead.sentiment_score}
                      </span>
                      <span className="text-xs" style={{ color: C.textDim }}>/10</span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[300px] truncate" style={{ color: C.textMuted }}>{lead.lead_summary}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: C.textDim }}>{fmtDate(lead.timestamp)}</td>
                    <td className="px-4 py-3">
                      <svg className={`w-4 h-4 transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} style={{ color: C.textDim }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                  </tr>
                  {expandedId === lead.id && (
                    <tr className="animate-fade-up">
                      <td colSpan={8} className="px-4 py-4" style={{ background: '#F8FAFC' }}>
                        <div className="grid grid-cols-2 gap-3">
                          <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                          <ExpandBlock label="Lead Summary" text={lead.lead_summary} color={C.accent} />
                          <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                          <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                          <ExpandBlock label="Desires" text={lead.desires} color="#8BA892" />
                          {lead.key_phrase && (
                            <div className="rounded-xl p-3.5 border-l-4" style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}`, borderLeftWidth: '4px', borderLeftColor: '#2B456D' }}>
                              <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#2B456D' }}>Key Phrase</p>
                              <p className="text-xs italic" style={{ color: C.text }}>&ldquo;{lead.key_phrase}&rdquo;</p>
                            </div>
                          )}
                          <ExpandBlock label="How They Define Success" text={lead.success_definition} color="#06b6d4" />
                          <ExpandBlock label="Identity Transformation" text={lead.identity_transformation} color="#8BA892" />
                          <ExpandBlock label="Past Investment" text={lead.past_investment} color="#F59E0B" />
                          <div className="rounded-xl p-3.5" style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}` }}>
                            <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: C.textMuted }}>Details</p>
                            <p className="text-xs" style={{ color: C.text }}>Sentiment: <strong>{lead.sentiment_score}/10</strong></p>
                            <p className="text-xs" style={{ color: C.text }}>Submitted: {fmtDate(lead.timestamp)}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 6: TOP ROADBLOCKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TopRoadblocks({ leads }: { leads: Lead[] }) {
  const roadblocks = countPhrases(leads, 'bottlenecks')
  const max = roadblocks[0]?.count || 1

  return (
    <div className="mb-6">
      <SectionTitle>Most Common Roadblocks Across All Respondents</SectionTitle>
      <Card>
        {roadblocks.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: C.textDim }}>No roadblock data yet</p>
        ) : (
          <div className="space-y-3">
            {roadblocks.slice(0, 10).map((rb, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E0E7FF' }}>
                  <span className="text-xs font-extrabold" style={{ color: C.accent }}>{i + 1}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm leading-snug" style={{ color: C.text }}>{rb.text}</p>
                    <span className="text-xs font-mono shrink-0 ml-2" style={{ color: C.textDim }}>{rb.count}x</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(rb.count / max) * 100}%`, background: `linear-gradient(90deg, #2B456D, #4A6FA5)` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MARKET READINESS VIEW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MarketReadinessView({ leads }: { leads: Lead[] }) {
  const columns: Array<{ key: 'Done-For-You' | 'DIY' | 'Hybrid'; label: string; color: string; badgeBg: string; badgeText: string }> = [
    { key: 'Done-For-You', label: 'Done-For-You', color: '#2B456D', badgeBg: '#E0E7FF', badgeText: '#2B456D' },
    { key: 'DIY', label: 'DIY', color: '#2E7D32', badgeBg: '#E8F5E9', badgeText: '#2E7D32' },
    { key: 'Hybrid', label: 'Hybrid', color: '#B45309', badgeBg: '#FEF3C7', badgeText: '#B45309' },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">📋</span>
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: 'Lexend, sans-serif' }}>Market Readiness Segments</h2>
          <p className="text-sm" style={{ color: C.textDim }}>{leads.length} total respondent{leads.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {columns.map(col => {
          const colLeads = leads.filter(l => l.market_readiness === col.key)
          return (
            <div key={col.key}>
              <Card className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: col.color }}>{col.label}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                    style={{ background: col.badgeBg, color: col.badgeText, borderColor: `${col.color}30` }}>
                    {colLeads.length}
                  </span>
                </div>
              </Card>
              <div className="space-y-3">
                {colLeads.length === 0 ? (
                  <Card><p className="text-sm text-center py-6" style={{ color: C.textDim }}>No leads</p></Card>
                ) : (
                  colLeads.map(lead => (
                    <Card key={lead.id}>
                      <p className="text-sm font-bold" style={{ color: C.text }}>{lead.name}</p>
                      <p className="text-xs mb-2" style={{ color: C.textDim }}>{lead.email || '—'}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <UrgencyBadge level={lead.urgency_level} />
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>{lead.lead_summary}</p>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN DASHBOARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('overview')
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

            {view === 'overview' && (
              <>
                <OverviewCards leads={leads} />
                <UrgencyChart leads={leads} />
                <MarketReadinessChart leads={leads} />
                <MarketFitLanguage leads={leads} />
                <KeyPhrasesWall leads={leads} />
                <LeadSegments leads={leads} />
                <AllRespondents leads={leads} />
                <TopRoadblocks leads={leads} />
              </>
            )}

            {view === 'all' && <AllRespondents leads={leads} />}

            {view === 'readiness' && <MarketReadinessView leads={leads} />}

            {(view === 'hot' || view === 'warm' || view === 'cold') && (
              <FilteredLeadView leads={leads} level={view === 'hot' ? 'Hot' : view === 'warm' ? 'Warm' : 'Cold'} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Filtered lead view for sidebar nav
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FilteredLeadView({ leads, level }: { leads: Lead[]; level: 'Hot' | 'Warm' | 'Cold' }) {
  const filtered = leads.filter(l => l.urgency_level === level)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const icons: Record<string, string> = { Hot: '🔥', Warm: '⚡', Cold: '❄️' }
  const colors: Record<string, string> = { Hot: C.hot, Warm: C.warm, Cold: C.cold }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{icons[level]}</span>
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: 'Lexend, sans-serif' }}>{level} Leads</h2>
          <p className="text-sm" style={{ color: C.textDim }}>{filtered.length} respondent{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-10">
          <p style={{ color: C.textDim }}>No {level.toLowerCase()} leads yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <Card key={lead.id}>
              <button onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)} className="w-full text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${colors[level]}15` }}>
                      <span className="text-xs font-bold" style={{ color: colors[level] }}>{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.text }}>{lead.name}</p>
                      <p className="text-xs" style={{ color: C.textDim }}>{lead.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UrgencyBadge level={lead.urgency_level} />
                    <MarketReadinessBadge readiness={lead.market_readiness} />
                    <span className="text-xs" style={{ color: C.textDim }}>{fmtDate(lead.timestamp)}</span>
                    <svg className={`w-4 h-4 transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} style={{ color: C.textDim }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mb-2 max-w-xs"><SentimentBar score={lead.sentiment_score} /></div>
                <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{lead.lead_summary}</p>
              </button>

              {expandedId === lead.id && (
                <div className="mt-4 pt-4 grid grid-cols-2 gap-3 animate-fade-up" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                  <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                  <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                  <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                  <ExpandBlock label="Desires" text={lead.desires} color="#8BA892" />
                  {lead.key_phrase && <ExpandBlock label="Key Phrase" text={lead.key_phrase} color="#2B456D" />}
                  <ExpandBlock label="Identity Transformation" text={lead.identity_transformation} color="#8BA892" />
                  <ExpandBlock label="Past Investment" text={lead.past_investment} color="#F59E0B" />
                  <ExpandBlock label="Wants to be Served" text={lead.service_preference} color="#7C3AED" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
