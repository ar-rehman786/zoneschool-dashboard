'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'
import { UrgencyBadge } from '../ui/UrgencyBadge'
import { StanceBadge } from '../ui/StanceBadge'
import { DriveTypeBadge } from '../ui/DriveTypeBadge'
import { SentimentBar } from '../ui/SentimentBar'
import { ExpandBlock } from '../ui/ExpandBlock'

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

export function TopProspects({ leads }: { leads: Lead[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
          <p className="text-lg font-semibold mb-2" style={{ color: C.text }}>No new prospects yet</p>
          <p className="text-sm" style={{ color: C.textDim }}>When new leads fill the form, they will appear here ranked by enrollment likelihood.</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>{prospects.length} prospect{prospects.length !== 1 ? 's' : ''} ranked by enrollment likelihood</SectionTitle>
      </div>

      <div className="space-y-4">
        {prospects.map(lead => (
          <Card key={lead.id}>
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E0E7FF' }}>
                  <span className="text-xs font-bold" style={{ color: C.accent }}>{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.text }}>{lead.name}</p>
                  <p className="text-xs" style={{ color: C.textDim }}>{lead.email || '\u2014'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <UrgencyBadge level={lead.urgency_level} />
                <StanceBadge stance={lead.stance} />
                <DriveTypeBadge driveType={lead.drive_type} />
                <div className="w-32"><SentimentBar score={lead.sentiment_score} /></div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm leading-relaxed mb-3" style={{ color: C.textMuted }}>{lead.lead_summary}</p>

            {/* Sales Strategy - PROMINENT */}
            {lead.sales_strategy && (
              <div className="rounded-xl p-4 mb-3"
                style={{ background: '#EFF6FF', borderLeft: '4px solid #3B82F6' }}>
                <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#2563EB' }}>Sales Strategy</p>
                <p className="text-sm leading-relaxed" style={{ color: C.text }}>{lead.sales_strategy}</p>
              </div>
            )}

            {/* Expandable details */}
            <button
              onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: C.accent }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1E3555' }}
              onMouseLeave={e => { e.currentTarget.style.color = C.accent }}
            >
              {expandedId === lead.id ? 'Hide details' : 'Show details'}
              <svg className={`w-3.5 h-3.5 transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedId === lead.id && (
              <div className="mt-4 pt-4 grid grid-cols-2 gap-3 animate-fade-up" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                <ExpandBlock label="Desires" text={lead.desires} color="#8BA892" />
                <ExpandBlock label="Past Investment" text={lead.past_investment} color="#F59E0B" />
                <ExpandBlock label="Identity Transformation" text={lead.identity_transformation} color="#8BA892" />
                <ExpandBlock label="How They Define Success" text={lead.success_definition} color="#06b6d4" />
                <ExpandBlock label="Service Preference" text={lead.service_preference} color="#7C3AED" />
                {lead.key_phrase && (
                  <div className="rounded-xl p-3.5 border-l-4" style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}`, borderLeftWidth: '4px', borderLeftColor: '#2B456D' }}>
                    <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#2B456D' }}>Key Phrase</p>
                    <p className="text-xs italic" style={{ color: C.text }}>&ldquo;{lead.key_phrase}&rdquo;</p>
                  </div>
                )}
                {lead.identity_tags.length > 0 && (
                  <div className="rounded-xl p-3.5" style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}` }}>
                    <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#7C3AED' }}>Identity Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.identity_tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: '#EDE9FE', color: '#5B21B6' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
