'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'
import { SentimentBar } from '../ui/SentimentBar'
import { ExpandBlock } from '../ui/ExpandBlock'

export function YourMembers({ leads }: { leads: Lead[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const members = leads.filter(l => l.is_active_client)
  const avgSentiment = members.length > 0
    ? (members.reduce((s, l) => s + l.sentiment_score, 0) / members.length).toFixed(1)
    : '\u2014'

  if (members.length === 0) {
    return (
      <div>
        <SectionTitle>Your Members</SectionTitle>
        <Card className="text-center py-16">
          <p className="text-lg font-semibold mb-2" style={{ color: C.text }}>No member responses yet</p>
          <p className="text-sm" style={{ color: C.textDim }}>When active Zone School members fill the form, their feedback appears here.</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div>
          <SectionTitle>{members.length} active member{members.length !== 1 ? 's' : ''} responded</SectionTitle>
          <p className="text-sm -mt-3 mb-4" style={{ color: C.textDim }}>Average sentiment: {avgSentiment}/10</p>
        </div>
      </div>

      <div className="space-y-4">
        {members.map(lead => (
          <Card key={lead.id}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEF9C3' }}>
                  <span className="text-xs font-bold" style={{ color: '#854D0E' }}>{lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.text }}>{lead.name}</p>
                  <p className="text-xs" style={{ color: C.textDim }}>{lead.email || '\u2014'}</p>
                </div>
              </div>
              <div className="w-32"><SentimentBar score={lead.sentiment_score} /></div>
            </div>

            {/* What they value */}
            {(lead.desires || lead.service_preference) && (
              <div className="rounded-xl p-3.5 mb-3" style={{ background: '#F0FDF4', border: `1px solid #BBF7D0` }}>
                <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#166534' }}>What They Value</p>
                <p className="text-xs leading-relaxed" style={{ color: C.text }}>{[lead.desires, lead.service_preference].filter(Boolean).join(' \u2022 ')}</p>
              </div>
            )}

            {/* How they define success */}
            {lead.success_definition && (
              <div className="rounded-xl p-3.5 mb-3" style={{ background: '#ECFEFF', border: `1px solid #A5F3FC` }}>
                <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#0E7490' }}>How They Define Success</p>
                <p className="text-xs leading-relaxed" style={{ color: C.text }}>{lead.success_definition}</p>
              </div>
            )}

            {/* Identity transformation */}
            {lead.identity_transformation && (
              <div className="rounded-xl p-3.5 mb-3" style={{ background: '#EDE9FE', border: `1px solid #DDD6FE` }}>
                <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#5B21B6' }}>Identity Transformation</p>
                <p className="text-xs leading-relaxed" style={{ color: C.text }}>{lead.identity_transformation}</p>
              </div>
            )}

            {/* Expandable for full details */}
            <button
              onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: C.accent }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1E3555' }}
              onMouseLeave={e => { e.currentTarget.style.color = C.accent }}
            >
              {expandedId === lead.id ? 'Hide details' : 'Show all details'}
              <svg className={`w-3.5 h-3.5 transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedId === lead.id && (
              <div className="mt-4 pt-4 grid grid-cols-2 gap-3 animate-fade-up" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                <ExpandBlock label="Past Investment" text={lead.past_investment} color="#F59E0B" />
                <ExpandBlock label="Tried Before" text={lead.tried_before} color="#06b6d4" />
                {lead.key_phrase && (
                  <div className="rounded-xl p-3.5 border-l-4" style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}`, borderLeftWidth: '4px', borderLeftColor: '#2B456D' }}>
                    <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#2B456D' }}>Key Phrase</p>
                    <p className="text-xs italic" style={{ color: C.text }}>&ldquo;{lead.key_phrase}&rdquo;</p>
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
