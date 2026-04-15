'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/types'
import { C, DRIVE_COLORS } from '@/lib/constants'
import { pct } from '@/lib/helpers'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'
import { UrgencyBadge } from '../ui/UrgencyBadge'
import { StanceBadge } from '../ui/StanceBadge'
import { DriveTypeBadge } from '../ui/DriveTypeBadge'
import { SentimentRing } from '../ui/SentimentRing'
import { ExpandBlock } from '../ui/ExpandBlock'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

function urgencyRank(u: string): number {
  if (u === 'Hot') return 1
  if (u === 'Warm') return 2
  return 3
}

function stanceRank(s: string): number {
  if (s === 'Committed') return 1
  if (s === 'Skeptical') return 2
  return 3
}

function urgencyColor(u: string): string {
  if (u === 'Hot') return C.hot
  if (u === 'Warm') return C.warm
  return C.cold
}

/* Circular gauge arc for stat cards */
function GaugeArc({ value, max = 10, size = 56 }: { value: number; max?: number; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = Math.PI * radius // half circle
  const progress = (value / max) * circumference
  const color = value >= 7 ? C.hot : value >= 4 ? C.warm : C.cold
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size / 2 + 8 }}>
      <svg width={size} height={size / 2 + 8} className="overflow-visible">
        <path
          d={`M 4 ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2 + 4}`}
          fill="none" stroke="#F1F5F9" strokeWidth={4} strokeLinecap="round"
        />
        <path
          d={`M 4 ${size / 2 + 4} A ${radius} ${radius} 0 0 1 ${size - 4} ${size / 2 + 4}`}
          fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute" style={{ bottom: 0, fontFamily: C.fontHeading, fontWeight: 700, fontSize: '16px', color }}>{value.toFixed(1)}</span>
    </div>
  )
}

export function TopProspects({ leads }: { leads: Lead[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showLegend, setShowLegend] = useState(false)

  const prospects = leads
    .filter(l => !l.is_active_client)
    .sort((a, b) => {
      const uDiff = urgencyRank(a.urgency_level) - urgencyRank(b.urgency_level)
      if (uDiff !== 0) return uDiff
      const sDiff = b.sentiment_score - a.sentiment_score
      if (sDiff !== 0) return sDiff
      return stanceRank(a.stance) - stanceRank(b.stance)
    })

  if (prospects.length === 0) {
    return (
      <div>
        <SectionTitle>Top Prospects</SectionTitle>
        <Card className="text-center py-16">
          <div className="text-4xl mb-4 opacity-30">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: C.textMuted }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-lg mb-2" style={{ color: C.text, fontFamily: C.fontHeading, fontWeight: 600 }}>No new prospects yet</p>
          <p style={{ color: C.textMuted, fontFamily: C.fontBody, fontSize: '14px' }}>When new leads fill the form, they will appear here ranked by enrollment likelihood.</p>
        </Card>
      </div>
    )
  }

  const hotCount = prospects.filter(l => l.urgency_level === 'Hot').length
  const avgSentiment = prospects.length > 0 ? prospects.reduce((s, l) => s + l.sentiment_score, 0) / prospects.length : 0

  // Top drive type
  const driveCounts: Record<string, number> = {}
  prospects.forEach(l => { driveCounts[l.drive_type] = (driveCounts[l.drive_type] || 0) + 1 })
  const topDrive = Object.entries(driveCounts).sort((a, b) => b[1] - a[1])[0]

  // Lead landscape chart data
  const chartData = prospects.slice(0, 15).map(l => ({
    name: l.name.length > 18 ? l.name.slice(0, 16) + '...' : l.name,
    score: l.sentiment_score,
    urgency: l.urgency_level,
    fill: urgencyColor(l.urgency_level),
  }))

  return (
    <div className="animate-fade-in">
      {/* Stat cards row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="uppercase tracking-wide mb-1" style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>Total Prospects</p>
          <p style={{ fontSize: '32px', fontFamily: C.fontHeading, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{prospects.length}</p>
          <p style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontBody, marginTop: '2px' }}>excluding active clients</p>
        </Card>
        <Card>
          <p className="uppercase tracking-wide mb-1" style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>Hot Leads</p>
          <p style={{ fontSize: '32px', fontFamily: C.fontHeading, fontWeight: 700, color: C.hot, lineHeight: 1.1 }}>{hotCount}</p>
          <p style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontBody, marginTop: '2px' }}>{pct(hotCount, prospects.length)}% of prospects</p>
        </Card>
        <Card>
          <p className="uppercase tracking-wide mb-1" style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>Avg Sentiment</p>
          <GaugeArc value={avgSentiment} />
        </Card>
        <Card>
          <p className="uppercase tracking-wide mb-1" style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>Top Drive Type</p>
          {topDrive ? (
            <>
              <p style={{ fontSize: '32px', fontFamily: C.fontHeading, fontWeight: 700, color: DRIVE_COLORS[topDrive[0]] || C.text, lineHeight: 1.1 }}>{topDrive[0]}</p>
              <p style={{ fontSize: '12px', color: C.textMuted, fontFamily: C.fontBody, marginTop: '2px' }}>{topDrive[1]} prospect{topDrive[1] !== 1 ? 's' : ''}</p>
            </>
          ) : (
            <p style={{ fontSize: '14px', color: C.textMuted, fontFamily: C.fontBody }}>No data</p>
          )}
        </Card>
      </div>

      {/* Lead Landscape chart */}
      <Card className="mb-6">
        <SectionTitle>Lead Landscape</SectionTitle>
        <p className="mb-4" style={{ fontSize: '13px', color: C.textMuted, fontFamily: C.fontBody, marginTop: '-12px' }}>Each bar = sentiment score, color = urgency level</p>
        <div style={{ height: Math.min(prospects.length * 36 + 20, 300), overflowY: prospects.length > 8 ? 'auto' : 'visible' }}>
          <div style={{ height: Math.max(prospects.slice(0, 15).length * 36 + 20, 120) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barSize={20} margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: C.textMuted, fontFamily: 'Questrial' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.text, fontFamily: 'Questrial' }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, borderRadius: '12px', fontFamily: 'Questrial', fontSize: '13px', boxShadow: C.cardShadow }}
                  cursor={{ fill: 'rgba(30,36,48,0.03)' }}
                  formatter={(v: number, _: string, p: { payload?: { urgency?: string } }) => [`${v}/10 sentiment`, p?.payload?.urgency ?? '']}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Legend card */}
      <Card className="mb-6">
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full flex items-center justify-between"
        >
          <span style={{ fontFamily: C.fontHeading, fontWeight: 600, fontSize: '14px', color: C.text }}>Understanding Your Prospects</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${showLegend ? 'rotate-180' : ''}`} style={{ color: C.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showLegend && (
          <div className="mt-4 grid grid-cols-2 gap-4 animate-fade-up">
            <div className="rounded-xl p-4" style={{ background: '#F8F9FA' }}>
              <p className="mb-2" style={{ fontFamily: C.fontHeading, fontWeight: 600, fontSize: '13px', color: C.text }}>Urgency</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><UrgencyBadge level="Hot" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Ready to enroll now</span></div>
                <div className="flex items-center gap-2"><UrgencyBadge level="Warm" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Interested but cautious</span></div>
                <div className="flex items-center gap-2"><UrgencyBadge level="Cold" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Still exploring</span></div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#F8F9FA' }}>
              <p className="mb-2" style={{ fontFamily: C.fontHeading, fontWeight: 600, fontSize: '13px', color: C.text }}>Stance</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><StanceBadge stance="Committed" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Invested heavily, seeking solutions</span></div>
                <div className="flex items-center gap-2"><StanceBadge stance="Skeptical" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Wants proof first</span></div>
                <div className="flex items-center gap-2"><StanceBadge stance="Burned" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Bad past experiences</span></div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#F8F9FA' }}>
              <p className="mb-2" style={{ fontFamily: C.fontHeading, fontWeight: 600, fontSize: '13px', color: C.text }}>Drive Type</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><DriveTypeBadge driveType="Healer" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Wants to transform patient lives</span></div>
                <div className="flex items-center gap-2"><DriveTypeBadge driveType="Builder" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Wants to scale practice</span></div>
                <div className="flex items-center gap-2"><DriveTypeBadge driveType="Teacher" /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}>Wants to educate other doctors</span></div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#F8F9FA' }}>
              <p className="mb-2" style={{ fontFamily: C.fontHeading, fontWeight: 600, fontSize: '13px', color: C.text }}>Core Motivation</p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2"><span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: C.hot }} /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}><strong>Patient Results</strong> &mdash; Clinical outcomes above all</span></div>
                <div className="flex items-start gap-2"><span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: C.accent }} /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}><strong>Practice Growth</strong> &mdash; Revenue and scale</span></div>
                <div className="flex items-start gap-2"><span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: '#0D9488' }} /><span style={{ fontSize: '12px', color: C.body, fontFamily: C.fontBody }}><strong>Personal Mastery</strong> &mdash; Continuous learning</span></div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Lead cards */}
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>{prospects.length} prospect{prospects.length !== 1 ? 's' : ''} ranked by enrollment likelihood</SectionTitle>
      </div>

      <div className="space-y-4">
        {prospects.map(lead => {
          const borderColor = urgencyColor(lead.urgency_level)
          const avatarBg = DRIVE_COLORS[lead.drive_type] || '#64748B'
          return (
            <div
              key={lead.id}
              className="bg-white rounded-[20px] p-6 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                border: `1px solid ${C.cardBorder}`,
                borderLeft: `4px solid ${borderColor}`,
                boxShadow: C.cardShadow,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(30,36,48,0.06), 0 12px 32px rgba(30,36,48,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = C.cardShadow }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: avatarBg }}>
                    <span style={{ fontSize: '13px', fontFamily: C.fontHeading, fontWeight: 700, color: '#FFFFFF' }}>{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: C.fontHeading, fontWeight: 600, fontSize: '16px', color: C.text }}>{lead.name}</p>
                    <p style={{ fontFamily: C.fontBody, fontSize: '13px', color: C.textMuted }}>{lead.email || '\u2014'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <UrgencyBadge level={lead.urgency_level} />
                  <StanceBadge stance={lead.stance} />
                  <DriveTypeBadge driveType={lead.drive_type} />
                  <SentimentRing score={lead.sentiment_score} size={40} />
                </div>
              </div>

              {/* Summary */}
              <p className="mb-3 line-clamp-3" style={{ fontFamily: C.fontBody, fontSize: '14px', color: C.body, lineHeight: '1.6' }}>{lead.lead_summary}</p>

              {/* Sales Strategy - Hero element */}
              {lead.sales_strategy && (
                <div className="rounded-xl p-4 mb-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(216,192,122,0.06), rgba(216,192,122,0.12))',
                    borderLeft: `3px solid ${C.accent}`,
                    boxShadow: 'inset 0 1px 3px rgba(216,192,122,0.08)',
                  }}>
                  <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: C.accent, fontFamily: C.fontHeading, fontWeight: 600 }}>Sales Playbook</p>
                  <p style={{ fontFamily: C.fontBody, fontSize: '13.5px', color: C.text, lineHeight: '1.6' }}>{lead.sales_strategy}</p>
                </div>
              )}

              {/* Expandable details */}
              <button
                onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                className="flex items-center gap-1 transition-all duration-200"
                style={{ color: C.accent, fontFamily: C.fontHeading, fontWeight: 600, fontSize: '13px' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C4A85E' }}
                onMouseLeave={e => { e.currentTarget.style.color = C.accent }}
              >
                {expandedId === lead.id ? 'Hide details' : 'Show details'}
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedId === lead.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedId === lead.id && (
                <div className="mt-4 pt-4 animate-fade-up" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                  <div className="grid grid-cols-2 gap-3">
                    <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                    <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                    <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                    <ExpandBlock label="Desires" text={lead.desires} color="#8BA892" />
                    <ExpandBlock label="Past Investment" text={lead.past_investment} color={C.warm} />
                    <ExpandBlock label="Identity Transformation" text={lead.identity_transformation} color="#8BA892" />
                    <ExpandBlock label="How They Define Success" text={lead.success_definition} color="#06b6d4" />
                    <ExpandBlock label="Service Preference" text={lead.service_preference} color="#7C3AED" />
                    {lead.key_phrase && (
                      <div className="rounded-xl p-3.5" style={{ background: '#FAFAF8', border: `1px solid ${C.cardBorder}`, borderLeft: `3px solid ${C.navy}` }}>
                        <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: C.navy, fontFamily: C.fontHeading, fontWeight: 600 }}>Key Phrase</p>
                        <p className="italic" style={{ fontFamily: C.fontBody, fontSize: '13px', color: C.text }}>&ldquo;{lead.key_phrase}&rdquo;</p>
                      </div>
                    )}
                  </div>
                  {lead.identity_tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {lead.identity_tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-xs"
                          style={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, color: C.text, fontFamily: C.fontHeading, fontWeight: 500 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
