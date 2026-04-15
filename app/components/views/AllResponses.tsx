'use client'

import { useState, Fragment } from 'react'
import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { fmtDate, isJunkLead } from '@/lib/helpers'
import { Card } from '../ui/Card'
import { SectionTitle } from '../ui/SectionTitle'
import { UrgencyBadge } from '../ui/UrgencyBadge'
import { StanceBadge } from '../ui/StanceBadge'
import { DriveTypeBadge } from '../ui/DriveTypeBadge'
import { ClientBadge } from '../ui/ClientBadge'
import { ExpandBlock } from '../ui/ExpandBlock'

type ClientFilter = 'all' | 'client' | 'prospect'
type UrgencyFilter = 'all' | 'Hot' | 'Warm' | 'Cold'

function exportCSV(leads: Lead[]) {
  const headers = ['Name', 'Email', 'Client', 'Urgency', 'Stance', 'Drive Type', 'Motivation', 'Sentiment', 'Summary', 'Date']
  const rows = leads.map(l => [
    l.name,
    l.email,
    l.is_active_client ? 'Client' : 'Prospect',
    l.urgency_level,
    l.stance,
    l.drive_type,
    l.core_motivation,
    String(l.sentiment_score),
    `"${l.lead_summary.replace(/"/g, '""')}"`,
    l.timestamp,
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `zoneschool-responses-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

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

  const selectStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: `1px solid ${C.cardBorder}`,
    color: C.text,
    boxShadow: C.cardShadow,
    fontFamily: C.fontHeading,
    fontWeight: 500,
    fontSize: '13px',
    borderRadius: '10px',
  }

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>All Responses</SectionTitle>
        <div className="flex items-center gap-3">
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value as ClientFilter)}
            className="px-3 py-2 focus:outline-none focus:ring-2"
            style={selectStyle}
          >
            <option value="all">All Status</option>
            <option value="client">Clients</option>
            <option value="prospect">Prospects</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value as UrgencyFilter)}
            className="px-3 py-2 focus:outline-none focus:ring-2"
            style={selectStyle}
          >
            <option value="all">All Urgency</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-56 transition-all focus:outline-none focus:ring-2"
              style={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, color: C.text, boxShadow: C.cardShadow, fontFamily: C.fontBody, fontSize: '13px', borderRadius: '10px' }}
            />
          </div>
          <button
            onClick={() => exportCSV(filtered)}
            className="px-3 py-2 transition-all duration-200"
            style={{
              fontFamily: C.fontHeading,
              fontWeight: 600,
              fontSize: '13px',
              background: 'transparent',
              color: C.accent,
              border: `1.5px solid ${C.accent}`,
              borderRadius: '10px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = '#FFFFFF' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.accent }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full" style={{ fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
              {['Name', 'Email', 'Client?', 'Urgency', 'Stance', 'Drive', 'Sentiment', 'Summary', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 uppercase tracking-widest"
                  style={{ fontSize: '11px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-10 text-center" style={{ color: C.textMuted, fontFamily: C.fontBody }}>No respondents found.</td></tr>
            ) : (
              filtered.map((lead, idx) => {
                const junk = isJunkLead(lead)
                const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#FAFAF8'
                return (
                <Fragment key={lead.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    className="cursor-pointer transition-colors duration-200"
                    style={{ borderBottom: `1px solid ${C.cardBorder}`, background: rowBg, opacity: junk ? 0.45 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F2' }}
                    onMouseLeave={e => { e.currentTarget.style.background = rowBg }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.text, fontFamily: C.fontHeading, fontWeight: 600 }}>
                      {lead.name}
                      {junk && <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: '#F1F5F9', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 500, fontSize: '10px' }}>TEST</span>}
                    </td>
                    <td className="px-4 py-3" style={{ color: C.textMuted, fontFamily: C.fontBody, fontSize: '12px' }}>{lead.email || '\u2014'}</td>
                    <td className="px-4 py-3"><ClientBadge isClient={lead.is_active_client} /></td>
                    <td className="px-4 py-3"><UrgencyBadge level={lead.urgency_level} /></td>
                    <td className="px-4 py-3"><StanceBadge stance={lead.stance} /></td>
                    <td className="px-4 py-3"><DriveTypeBadge driveType={lead.drive_type} /></td>
                    <td className="px-4 py-3">
                      <span style={{ fontFamily: C.fontHeading, fontWeight: 700, color: lead.sentiment_score >= 7 ? C.hot : lead.sentiment_score >= 4 ? C.warm : C.cold }}>
                        {lead.sentiment_score}
                      </span>
                      <span style={{ fontSize: '11px', color: C.textMuted }}>/10</span>
                    </td>
                    <td className="px-4 py-3 max-w-[180px] truncate" style={{ color: C.textMuted, fontFamily: C.fontBody, fontSize: '12px' }}>{lead.lead_summary}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: C.textMuted, fontFamily: C.fontBody, fontSize: '12px' }}>{fmtDate(lead.timestamp)}</td>
                    <td className="px-4 py-3">
                      <svg className={`w-4 h-4 transition-transform duration-200 ${expandedId === lead.id ? 'rotate-180' : ''}`} style={{ color: C.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                  </tr>
                  {expandedId === lead.id && (
                    <tr className="animate-fade-up">
                      <td colSpan={10} className="px-4 py-4" style={{ background: '#FAFAF8' }}>
                        <div className="grid grid-cols-2 gap-3">
                          <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                          <ExpandBlock label="Lead Summary" text={lead.lead_summary} color={C.navy} />
                          <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                          <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                          <ExpandBlock label="Desires" text={lead.desires} color="#8BA892" />
                          {lead.key_phrase && (
                            <div className="rounded-xl p-3.5" style={{ background: '#FAFAF8', border: `1px solid ${C.cardBorder}`, borderLeft: `3px solid ${C.navy}` }}>
                              <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: C.navy, fontFamily: C.fontHeading, fontWeight: 600 }}>Key Phrase</p>
                              <p className="italic" style={{ fontFamily: C.fontBody, fontSize: '13px', color: C.text }}>&ldquo;{lead.key_phrase}&rdquo;</p>
                            </div>
                          )}
                          <ExpandBlock label="How They Define Success" text={lead.success_definition} color="#06b6d4" />
                          <ExpandBlock label="Identity Transformation" text={lead.identity_transformation} color="#8BA892" />
                          <ExpandBlock label="Past Investment" text={lead.past_investment} color={C.warm} />

                          <div className="rounded-xl p-3.5" style={{ background: '#FAFAF8', border: `1px solid ${C.cardBorder}` }}>
                            <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: C.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>Profile</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <StanceBadge stance={lead.stance} />
                              <DriveTypeBadge driveType={lead.drive_type} />
                            </div>
                            <p style={{ fontFamily: C.fontBody, fontSize: '12px', color: C.body }}>Core Motivation: <strong>{lead.core_motivation}</strong></p>
                            <p style={{ fontFamily: C.fontBody, fontSize: '12px', color: C.body }}>Sentiment: <strong>{lead.sentiment_score}/10</strong></p>
                            <p style={{ fontFamily: C.fontBody, fontSize: '12px', color: C.body }}>Submitted: {fmtDate(lead.timestamp)}</p>
                          </div>

                          {lead.identity_tags.length > 0 && (
                            <div className="rounded-xl p-3.5" style={{ background: '#FAFAF8', border: `1px solid ${C.cardBorder}` }}>
                              <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: '#7C3AED', fontFamily: C.fontHeading, fontWeight: 600 }}>Identity Tags</p>
                              <div className="flex flex-wrap gap-1.5">
                                {lead.identity_tags.map((tag, i) => (
                                  <span key={i} className="px-2.5 py-1 rounded-full"
                                    style={{ background: '#FFFFFF', border: `1px solid ${C.cardBorder}`, fontFamily: C.fontHeading, fontSize: '12px', fontWeight: 500, color: C.text }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {lead.sales_strategy && (
                            <div className="col-span-2 rounded-xl p-4"
                              style={{
                                background: 'linear-gradient(135deg, rgba(216,192,122,0.06), rgba(216,192,122,0.12))',
                                borderLeft: `3px solid ${C.accent}`,
                                boxShadow: 'inset 0 1px 3px rgba(216,192,122,0.08)',
                              }}>
                              <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: C.accent, fontFamily: C.fontHeading, fontWeight: 600 }}>Sales Playbook</p>
                              <p style={{ fontFamily: C.fontBody, fontSize: '13.5px', color: C.text, lineHeight: '1.6' }}>{lead.sales_strategy}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
