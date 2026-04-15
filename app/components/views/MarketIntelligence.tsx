'use client'

import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { collectUnique, countPhrases, isJunkPhrase } from '@/lib/helpers'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'

interface DonutDatum {
  name: string
  value: number
  color: string
}

function DonutChart({ title, data }: { title: string; data: DonutDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const dominant = data.reduce((a, b) => a.value >= b.value ? a : b, data[0])
  const dominantPct = total > 0 ? Math.round((dominant.value / total) * 100) : 0

  return (
    <div>
      <p className="uppercase tracking-wide mb-3 text-center" style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>{title}</p>
      <div className="relative" style={{ width: 160, height: 160, margin: '0 auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, borderRadius: '10px', fontFamily: 'Questrial', fontSize: '13px', boxShadow: C.cardShadow }}
              formatter={(v: number, name: string) => [`${v} (${total > 0 ? Math.round((v / total) * 100) : 0}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span style={{ fontFamily: C.fontHeading, fontWeight: 700, fontSize: '18px', color: dominant.color }}>{dominantPct}%</span>
          <span style={{ fontFamily: C.fontBody, fontSize: '11px', color: C.textMuted }}>{dominant.name}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
            <span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MarketIntelligence({ leads }: { leads: Lead[] }) {
  const hotLeads = leads.filter(l => l.urgency_level === 'Hot')

  // Section 1: Words That Convert (Hot leads only)
  const boxes = [
    { title: 'How They Describe The Problem', items: collectUnique(hotLeads, 'problem_description'), color: '#DC2626' },
    { title: 'Bottlenecks They Face', items: collectUnique(hotLeads, 'bottlenecks'), color: '#F59E0B' },
    { title: 'What They Fear', items: collectUnique(hotLeads, 'fears'), color: '#A6809F' },
    { title: 'What They Are Looking For', items: collectUnique(hotLeads, 'desires'), color: '#8BA892' },
    { title: 'How They Define Success', items: collectUnique(hotLeads, 'success_definition'), color: '#06b6d4' },
    { title: 'Service Preference', items: collectUnique(hotLeads, 'service_preference'), color: '#7C3AED' },
  ]

  // Section 2: What Stops Them (all leads, filtered)
  const fearsPhrases = countPhrases(leads, 'fears')
  const bottlenecksPhrases = countPhrases(leads, 'bottlenecks')
  const mergedMap: Record<string, number> = {}
  for (const item of [...fearsPhrases, ...bottlenecksPhrases]) {
    if (!isJunkPhrase(item.text)) {
      mergedMap[item.text] = (mergedMap[item.text] || 0) + item.count
    }
  }
  const objections = Object.entries(mergedMap)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
  const maxObjCount = objections[0]?.count || 1

  // Section 3: Identity Patterns (filtered)
  const tagCounts: Record<string, number> = {}
  leads.forEach(l => l.identity_tags.forEach(t => {
    if (!isJunkPhrase(t)) {
      tagCounts[t] = (tagCounts[t] || 0) + 1
    }
  }))
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

  const driveDonut: DonutDatum[] = [
    { name: 'Healer', value: leads.filter(l => l.drive_type === 'Healer').length, color: '#0D9488' },
    { name: 'Builder', value: leads.filter(l => l.drive_type === 'Builder').length, color: '#2563EB' },
    { name: 'Teacher', value: leads.filter(l => l.drive_type === 'Teacher').length, color: '#7C3AED' },
  ]

  const motivationDonut: DonutDatum[] = [
    { name: 'Patient Results', value: leads.filter(l => l.core_motivation === 'Patient Results').length, color: '#DC2626' },
    { name: 'Practice Growth', value: leads.filter(l => l.core_motivation === 'Practice Growth').length, color: '#D8C07A' },
    { name: 'Personal Mastery', value: leads.filter(l => l.core_motivation === 'Personal Mastery').length, color: '#0D9488' },
  ]

  const stanceDonut: DonutDatum[] = [
    { name: 'Committed', value: leads.filter(l => l.stance === 'Committed').length, color: '#16A34A' },
    { name: 'Skeptical', value: leads.filter(l => l.stance === 'Skeptical').length, color: '#F59E0B' },
    { name: 'Burned', value: leads.filter(l => l.stance === 'Burned').length, color: '#DC2626' },
  ]

  // Urgency chart data
  const total = leads.length
  const urgencyData = [
    { name: 'Hot', count: leads.filter(l => l.urgency_level === 'Hot').length, pct: total > 0 ? Math.round((leads.filter(l => l.urgency_level === 'Hot').length / total) * 100) : 0, fill: C.hot },
    { name: 'Warm', count: leads.filter(l => l.urgency_level === 'Warm').length, pct: total > 0 ? Math.round((leads.filter(l => l.urgency_level === 'Warm').length / total) * 100) : 0, fill: C.warm },
    { name: 'Cold', count: leads.filter(l => l.urgency_level === 'Cold').length, pct: total > 0 ? Math.round((leads.filter(l => l.urgency_level === 'Cold').length / total) * 100) : 0, fill: C.cold },
  ]

  // Key phrases (filtered)
  const phrases = leads
    .filter(l => l.key_phrase && !isJunkPhrase(l.key_phrase))
    .map(l => ({ phrase: l.key_phrase, name: l.name }))

  return (
    <div className="animate-fade-in">
      {/* Urgency Chart */}
      <Card className="mb-6">
        <SectionTitle>Timeline Urgency Breakdown</SectionTitle>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={urgencyData} layout="vertical" barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.textMuted, fontFamily: 'Questrial' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: C.text, fontWeight: 600, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, borderRadius: '12px', fontFamily: 'Questrial', fontSize: '13px', boxShadow: C.cardShadow }}
                cursor={{ fill: 'rgba(30,36,48,0.03)' }}
                formatter={(v: number, _: string, p: { payload?: { pct?: number } }) => [`${v} leads (${p?.payload?.pct ?? 0}%)`, '']}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {urgencyData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-2 mt-3">
          {urgencyData.map(d => (
            <span key={d.name} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: `${d.fill}12`, color: d.fill, fontFamily: C.fontHeading, fontWeight: 600 }}>
              {d.name}: {d.count} ({d.pct}%)
            </span>
          ))}
        </div>
      </Card>

      {/* Section 1: Words That Convert */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <SectionTitle>Words That Convert</SectionTitle>
          <span style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontBody }}>From {hotLeads.length} hot lead{hotLeads.length !== 1 ? 's' : ''}</span>
        </div>
        <p className="mb-4" style={{ fontSize: '13px', color: C.textMuted, fontFamily: C.fontBody, marginTop: '-12px' }}>Language from your hottest prospects</p>
        <div className="grid grid-cols-2 gap-4">
          {boxes.map(b => (
            <Card key={b.title} className="overflow-hidden p-0">
              <div style={{ borderTop: `3px solid ${b.color}` }} className="p-5">
                <p className="uppercase tracking-wider mb-3" style={{ fontSize: '12px', color: b.color, fontFamily: C.fontHeading, fontWeight: 600 }}>{b.title}</p>
                {b.items.length === 0 ? (
                  <p className="italic" style={{ fontSize: '13px', color: C.textMuted, fontFamily: C.fontBody }}>No data yet</p>
                ) : (
                  <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {b.items.filter(item => !isJunkPhrase(item)).slice(0, 12).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed" style={{ color: C.body, fontFamily: C.fontBody, fontSize: '13px' }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: b.color, opacity: 0.5 }} />
                        &ldquo;{item}&rdquo;
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 2: What Stops Them */}
      <div className="mb-6">
        <SectionTitle>What Stops Them</SectionTitle>
        <p className="mb-4" style={{ fontSize: '13px', color: C.textMuted, fontFamily: C.fontBody, marginTop: '-12px' }}>Top objections and blockers across all respondents</p>
        <Card>
          {objections.length === 0 ? (
            <p className="text-center py-6" style={{ fontSize: '14px', color: C.textMuted, fontFamily: C.fontBody }}>No data yet</p>
          ) : (
            <div className="space-y-0">
              {objections.slice(0, 10).map((rb, i) => (
                <div key={i} className="flex items-start gap-3 py-3 px-2" style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8F9FA', borderRadius: '8px' }}>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: C.navy }}>
                    <span style={{ fontSize: '11px', fontFamily: C.fontHeading, fontWeight: 700, color: '#FFFFFF' }}>{i + 1}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="leading-snug" style={{ fontSize: '14px', color: C.body, fontFamily: C.fontBody }}>{rb.text}</p>
                      <span className="shrink-0 ml-2" style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>{rb.count}x</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(rb.count / maxObjCount) * 100}%`, background: `linear-gradient(90deg, ${C.accent}, #E8D59A)` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Section 3: Identity Patterns */}
      <div className="mb-6">
        <SectionTitle>Identity Patterns</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <p className="uppercase tracking-wide mb-3" style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>Identity Tags</p>
            {sortedTags.length === 0 ? (
              <p className="italic" style={{ fontSize: '13px', color: C.textMuted, fontFamily: C.fontBody }}>No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sortedTags.map(([tag, count]) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, fontFamily: C.fontHeading, fontSize: '13px', fontWeight: 500, color: C.text }}>
                    {tag}
                    <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: C.accent, color: '#FFFFFF', fontSize: '10px', fontWeight: 700 }}>{count}</span>
                  </span>
                ))}
              </div>
            )}
          </Card>
          <Card className="flex items-center justify-center">
            <DonutChart title="Drive Type" data={driveDonut} />
          </Card>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex items-center justify-center">
            <DonutChart title="Core Motivation" data={motivationDonut} />
          </Card>
          <Card className="flex items-center justify-center">
            <DonutChart title="Stance" data={stanceDonut} />
          </Card>
        </div>
      </div>

      {/* Section 4: Key Phrases */}
      <div className="mb-6">
        <SectionTitle>Key Phrases &mdash; Voice of the Doctor</SectionTitle>
        {phrases.length === 0 ? (
          <Card><p className="text-center py-6" style={{ fontSize: '14px', color: C.textMuted, fontFamily: C.fontBody }}>No key phrases extracted yet.</p></Card>
        ) : (
          <div className="flex flex-wrap gap-3">
            {phrases.map((p, i) => (
              <div key={i} className="relative rounded-[16px] p-5 overflow-hidden"
                style={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, boxShadow: C.cardShadow }}>
                {/* Decorative quote mark */}
                <span className="absolute top-1 left-3 select-none pointer-events-none" style={{ fontFamily: C.fontHeading, fontSize: '48px', color: C.accent, opacity: 0.15, lineHeight: 1 }}>&ldquo;</span>
                <p className="relative italic" style={{ fontFamily: C.fontBody, fontSize: '14px', color: C.body, paddingLeft: '4px', lineHeight: '1.6' }}>{p.phrase}</p>
                <p className="mt-2" style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 500 }}>&mdash; {p.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
