'use client'

import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { collectUnique, countPhrases } from '@/lib/helpers'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

function HorizontalDistribution({ title, data }: { title: string; data: Array<{ name: string; count: number; color: string }> }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: C.textMuted }}>{title}</p>
      <div className="space-y-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="text-xs font-semibold w-28 shrink-0" style={{ color: C.text }}>{d.name}</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: total > 0 ? `${(d.count / total) * 100}%` : '0%', background: d.color, minWidth: d.count > 0 ? '24px' : '0' }} />
            </div>
            <span className="text-xs font-mono w-8 text-right" style={{ color: C.textDim }}>{d.count}</span>
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
    { title: 'How They Describe The Problem', items: collectUnique(hotLeads, 'problem_description'), color: '#DC2626', border: 'border-l-red-600' },
    { title: 'Bottlenecks They Face', items: collectUnique(hotLeads, 'bottlenecks'), color: '#F59E0B', border: 'border-l-amber-500' },
    { title: 'What They Fear', items: collectUnique(hotLeads, 'fears'), color: '#A6809F', border: 'border-l-[#A6809F]' },
    { title: 'What They Are Looking For', items: collectUnique(hotLeads, 'desires'), color: '#8BA892', border: 'border-l-[#8BA892]' },
    { title: 'How They Define Success', items: collectUnique(hotLeads, 'success_definition'), color: '#06b6d4', border: 'border-l-cyan-500' },
    { title: 'Service Preference', items: collectUnique(hotLeads, 'service_preference'), color: '#7C3AED', border: 'border-l-violet-600' },
  ]

  // Section 2: What Stops Them (all leads)
  const fearsPhrases = countPhrases(leads, 'fears')
  const bottlenecksPhrases = countPhrases(leads, 'bottlenecks')
  const mergedMap: Record<string, number> = {}
  for (const item of [...fearsPhrases, ...bottlenecksPhrases]) {
    mergedMap[item.text] = (mergedMap[item.text] || 0) + item.count
  }
  const objections = Object.entries(mergedMap)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
  const maxObjCount = objections[0]?.count || 1

  // Section 3: Identity Patterns
  const tagCounts: Record<string, number> = {}
  leads.forEach(l => l.identity_tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])

  const driveData = [
    { name: 'Healer', count: leads.filter(l => l.drive_type === 'Healer').length, color: '#0D9488' },
    { name: 'Builder', count: leads.filter(l => l.drive_type === 'Builder').length, color: '#2563EB' },
    { name: 'Teacher', count: leads.filter(l => l.drive_type === 'Teacher').length, color: '#7C3AED' },
  ]

  const motivationData = [
    { name: 'Patient Results', count: leads.filter(l => l.core_motivation === 'Patient Results').length, color: '#DC2626' },
    { name: 'Practice Growth', count: leads.filter(l => l.core_motivation === 'Practice Growth').length, color: '#F59E0B' },
    { name: 'Personal Mastery', count: leads.filter(l => l.core_motivation === 'Personal Mastery').length, color: '#2B456D' },
  ]

  const stanceData = [
    { name: 'Committed', count: leads.filter(l => l.stance === 'Committed').length, color: '#16A34A' },
    { name: 'Skeptical', count: leads.filter(l => l.stance === 'Skeptical').length, color: '#D97706' },
    { name: 'Burned', count: leads.filter(l => l.stance === 'Burned').length, color: '#DC2626' },
  ]

  // Section 4: Urgency chart data
  const total = leads.length
  const urgencyData = [
    { name: 'Hot', count: leads.filter(l => l.urgency_level === 'Hot').length, pct: total > 0 ? Math.round((leads.filter(l => l.urgency_level === 'Hot').length / total) * 100) : 0, fill: C.hot },
    { name: 'Warm', count: leads.filter(l => l.urgency_level === 'Warm').length, pct: total > 0 ? Math.round((leads.filter(l => l.urgency_level === 'Warm').length / total) * 100) : 0, fill: C.warm },
    { name: 'Cold', count: leads.filter(l => l.urgency_level === 'Cold').length, pct: total > 0 ? Math.round((leads.filter(l => l.urgency_level === 'Cold').length / total) * 100) : 0, fill: C.cold },
  ]

  // Key phrases
  const phrases = leads.filter(l => l.key_phrase).map(l => ({ phrase: l.key_phrase, name: l.name }))

  return (
    <div>
      {/* Urgency Chart */}
      <Card className="mb-6">
        <SectionTitle>Timeline Urgency Breakdown</SectionTitle>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={urgencyData} layout="vertical" barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: C.text, fontWeight: 600 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(43,69,109,0.1)', borderRadius: '12px', color: C.text, fontSize: '13px' }}
                cursor={{ fill: 'rgba(43,69,109,0.04)' }}
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
            <span key={d.name} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${d.fill}15`, color: d.fill }}>
              {d.name}: {d.count} ({d.pct}%)
            </span>
          ))}
        </div>
      </Card>

      {/* Section 1: Words That Convert */}
      <div className="mb-6">
        <SectionTitle>Words That Convert</SectionTitle>
        <p className="text-xs mb-4" style={{ color: C.textDim }}>Language from your hottest prospects</p>
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

      {/* Section 2: What Stops Them */}
      <div className="mb-6">
        <SectionTitle>What Stops Them</SectionTitle>
        <p className="text-xs mb-4" style={{ color: C.textDim }}>Top objections and blockers across all respondents</p>
        <Card>
          {objections.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C.textDim }}>No data yet</p>
          ) : (
            <div className="space-y-3">
              {objections.slice(0, 10).map((rb, i) => (
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
                        style={{ width: `${(rb.count / maxObjCount) * 100}%`, background: 'linear-gradient(90deg, #2B456D, #4A6FA5)' }}
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
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.textMuted }}>Identity Tags</p>
            {sortedTags.length === 0 ? (
              <p className="text-sm italic" style={{ color: C.textDim }}>No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sortedTags.map(([tag, count]) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: '#EDE9FE', color: '#5B21B6' }}>
                    {tag} ({count})
                  </span>
                ))}
              </div>
            )}
          </Card>
          <Card>
            <HorizontalDistribution title="Drive Type" data={driveData} />
            <HorizontalDistribution title="Core Motivation" data={motivationData} />
            <HorizontalDistribution title="Stance" data={stanceData} />
          </Card>
        </div>
      </div>

      {/* Section 4: Key Phrases */}
      <div className="mb-6">
        <SectionTitle>Key Phrases &mdash; Voice of the Doctor</SectionTitle>
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
    </div>
  )
}
