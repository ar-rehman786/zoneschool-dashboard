'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { useTheme } from '@/lib/theme'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'
import { SentimentRing } from '../ui/SentimentRing'
import { ExpandBlock } from '../ui/ExpandBlock'

export function YourMembers({ leads }: { leads: Lead[] }) {
  const t = useTheme()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const members = leads.filter(l => l.is_active_client)
  const avgSentiment = members.length > 0
    ? (members.reduce((s, l) => s + l.sentiment_score, 0) / members.length).toFixed(1)
    : '\u2014'

  const subtleBg = t.isDark ? '#151928' : '#FAFAF8'

  if (members.length === 0) {
    return (
      <div className="animate-fade-in">
        <SectionTitle>Your Members</SectionTitle>
        <Card className="text-center py-20">
          <div className="mb-5">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: t.textMuted, opacity: 0.3 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-lg mb-2" style={{ color: t.text, fontFamily: C.fontHeading, fontWeight: 600 }}>No member responses yet</p>
          <p className="max-w-md mx-auto" style={{ color: t.textMuted, fontFamily: C.fontBody, fontSize: '14px', lineHeight: '1.6' }}>
            When active Zone School members fill the form, their feedback appears here. Member insights help you understand what your students value most.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div>
          <SectionTitle>{members.length} active member{members.length !== 1 ? 's' : ''} responded</SectionTitle>
          <p className="-mt-3 mb-4" style={{ color: t.textMuted, fontFamily: C.fontBody, fontSize: '14px' }}>Average sentiment: {avgSentiment}/10</p>
        </div>
      </div>

      <div className="space-y-4">
        {members.map(lead => (
          <div
            key={lead.id}
            className="rounded-2xl p-4 lg:p-6 transition-all duration-200"
            style={{
              background: t.card,
              border: `1px solid ${t.cardBorder}`,
              borderLeft: `4px solid ${C.accent}`,
              boxShadow: t.cardShadow,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.accent }}>
                  <span style={{ fontSize: '13px', fontFamily: C.fontHeading, fontWeight: 700, color: '#FFFFFF' }}>{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div>
                  <p style={{ fontFamily: C.fontHeading, fontWeight: 600, fontSize: '16px', color: t.text }}>{lead.name}</p>
                  <p style={{ fontFamily: C.fontBody, fontSize: '13px', color: t.textMuted }}>{lead.email || '\u2014'}</p>
                </div>
              </div>
              <SentimentRing score={lead.sentiment_score} size={42} />
            </div>

            {/* What they value */}
            {(lead.desires || lead.service_preference) && (
              <div className="rounded-xl p-3.5 mb-3" style={{ background: t.isDark ? 'rgba(22,163,74,0.1)' : '#F0FDF4', border: `1px solid ${t.isDark ? 'rgba(22,163,74,0.2)' : '#BBF7D0'}` }}>
                <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: '#166534', fontFamily: C.fontHeading, fontWeight: 600 }}>What They Value</p>
                <p style={{ fontFamily: C.fontBody, fontSize: '13px', color: t.body, lineHeight: '1.6' }}>{[lead.desires, lead.service_preference].filter(Boolean).join(' \u2022 ')}</p>
              </div>
            )}

            {/* How they define success */}
            {lead.success_definition && (
              <div className="rounded-xl p-3.5 mb-3" style={{ background: t.isDark ? 'rgba(14,116,144,0.1)' : '#ECFEFF', border: `1px solid ${t.isDark ? 'rgba(14,116,144,0.2)' : '#A5F3FC'}` }}>
                <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: '#0E7490', fontFamily: C.fontHeading, fontWeight: 600 }}>How They Define Success</p>
                <p style={{ fontFamily: C.fontBody, fontSize: '13px', color: t.body, lineHeight: '1.6' }}>{lead.success_definition}</p>
              </div>
            )}

            {/* Identity transformation */}
            {lead.identity_transformation && (
              <div className="rounded-xl p-3.5 mb-3" style={{ background: t.isDark ? 'rgba(91,33,182,0.1)' : '#EDE9FE', border: `1px solid ${t.isDark ? 'rgba(91,33,182,0.2)' : '#DDD6FE'}` }}>
                <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: '#5B21B6', fontFamily: C.fontHeading, fontWeight: 600 }}>Identity Transformation</p>
                <p style={{ fontFamily: C.fontBody, fontSize: '13px', color: t.body, lineHeight: '1.6' }}>{lead.identity_transformation}</p>
              </div>
            )}

            {/* Expandable for full details */}
            <button
              onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              className="flex items-center gap-1 transition-all duration-200"
              style={{ color: C.accent, fontFamily: C.fontHeading, fontWeight: 600, fontSize: '13px' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#C4A85E' }}
              onMouseLeave={e => { e.currentTarget.style.color = C.accent }}
            >
              {expandedId === lead.id ? 'Hide details' : 'Show all details'}
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedId === lead.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedId === lead.id && (
              <div className="mt-4 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 animate-fade-up" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                <ExpandBlock label="Past Investment" text={lead.past_investment} color={C.warm} />
                <ExpandBlock label="Tried Before" text={lead.tried_before} color="#06b6d4" />
                {lead.key_phrase && (
                  <div className="rounded-xl p-3.5" style={{ background: subtleBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${C.navy}` }}>
                    <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: t.isDark ? '#94A3B8' : C.navy, fontFamily: C.fontHeading, fontWeight: 600 }}>Key Phrase</p>
                    <p className="italic" style={{ fontFamily: C.fontBody, fontSize: '13px', color: t.text }}>&ldquo;{lead.key_phrase}&rdquo;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
