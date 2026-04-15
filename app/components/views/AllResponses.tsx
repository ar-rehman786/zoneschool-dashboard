'use client'

import { useState, Fragment } from 'react'
import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { fmtDate } from '@/lib/helpers'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'
import { UrgencyBadge } from '../ui/UrgencyBadge'
import { StanceBadge } from '../ui/StanceBadge'
import { DriveTypeBadge } from '../ui/DriveTypeBadge'
import { ClientBadge } from '../ui/ClientBadge'
import { ExpandBlock } from '../ui/ExpandBlock'

type ClientFilter = 'all' | 'client' | 'prospect'
type UrgencyFilter = 'all' | 'Hot' | 'Warm' | 'Cold'

export function AllResponses({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [clientFilter, setClientFilter] = useState<ClientFilter>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all')

  let filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.lead_summary.toLowerCase().includes(search.toLowerCase())
  )

  if (clientFilter === 'client') filtered = filtered.filter(l => l.is_active_client)
  if (clientFilter === 'prospect') filtered = filtered.filter(l => !l.is_active_client)
  if (urgencyFilter !== 'all') filtered = filtered.filter(l => l.urgency_level === urgencyFilter)

  const selectStyle = {
    background: '#FFFFFF',
    border: `1px solid ${C.cardBorder}`,
    color: C.text,
    boxShadow: C.cardShadow,
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>All Responses</SectionTitle>
        <div className="flex items-center gap-3">
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value as ClientFilter)}
            className="px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2"
            style={selectStyle}
          >
            <option value="all">All Status</option>
            <option value="client">Clients</option>
            <option value="prospect">Prospects</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value as UrgencyFilter)}
            className="px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2"
            style={selectStyle}
          >
            <option value="all">All Urgency</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
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
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
              {['Name', 'Email', 'Client?', 'Urgency', 'Stance', 'Drive', 'Sentiment', 'Summary', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 uppercase tracking-widest font-bold" style={{ fontSize: '0.7rem', color: C.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-10 text-center" style={{ color: C.textDim }}>No respondents found.</td></tr>
            ) : (
              filtered.map(lead => (
                <Fragment key={lead.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    className="cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                    style={{ borderBottom: `1px solid ${C.cardBorder}` }}
                  >
                    <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: C.text }}>{lead.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.textMuted }}>{lead.email || '\u2014'}</td>
                    <td className="px-4 py-3"><ClientBadge isClient={lead.is_active_client} /></td>
                    <td className="px-4 py-3"><UrgencyBadge level={lead.urgency_level} /></td>
                    <td className="px-4 py-3"><StanceBadge stance={lead.stance} /></td>
                    <td className="px-4 py-3"><DriveTypeBadge driveType={lead.drive_type} /></td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold" style={{ color: lead.sentiment_score >= 7 ? C.hot : lead.sentiment_score >= 4 ? C.warm : C.cold }}>
                        {lead.sentiment_score}
                      </span>
                      <span className="text-xs" style={{ color: C.textDim }}>/10</span>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: C.textMuted }}>{lead.lead_summary}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: C.textDim }}>{fmtDate(lead.timestamp)}</td>
                    <td className="px-4 py-3">
                      <svg className={`w-4 h-4 transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} style={{ color: C.textDim }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                  </tr>
                  {expandedId === lead.id && (
                    <tr className="animate-fade-up">
                      <td colSpan={10} className="px-4 py-4" style={{ background: '#F8FAFC' }}>
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

                          {/* New fields */}
                          <div className="rounded-xl p-3.5" style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}` }}>
                            <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: C.textMuted }}>Profile</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <StanceBadge stance={lead.stance} />
                              <DriveTypeBadge driveType={lead.drive_type} />
                            </div>
                            <p className="text-xs" style={{ color: C.text }}>Core Motivation: <strong>{lead.core_motivation}</strong></p>
                            <p className="text-xs" style={{ color: C.text }}>Sentiment: <strong>{lead.sentiment_score}/10</strong></p>
                            <p className="text-xs" style={{ color: C.text }}>Submitted: {fmtDate(lead.timestamp)}</p>
                          </div>

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

                          {lead.sales_strategy && (
                            <div className="col-span-2 rounded-xl p-4"
                              style={{ background: '#EFF6FF', borderLeft: '4px solid #3B82F6' }}>
                              <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color: '#2563EB' }}>Sales Strategy</p>
                              <p className="text-sm leading-relaxed" style={{ color: C.text }}>{lead.sales_strategy}</p>
                            </div>
                          )}
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
