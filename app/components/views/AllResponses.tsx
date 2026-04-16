'use client'

import { useState, Fragment } from 'react'
import type { Lead } from '@/lib/types'
import { C } from '@/lib/constants'
import { useTheme } from '@/lib/theme'
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

const chevronSvg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239AA4B5' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")"

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
  const t = useTheme()
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

  const inputBorder = t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(30,36,48,0.1)'

  const selectStyle: React.CSSProperties = {
    appearance: 'none',
    WebkitAppearance: 'none',
    background: t.card,
    border: `1px solid ${inputBorder}`,
    color: t.text,
    fontFamily: C.fontHeading,
    fontWeight: 500,
    fontSize: '14px',
    borderRadius: '12px',
    paddingLeft: '16px',
    paddingRight: '36px',
    paddingTop: '10px',
    paddingBottom: '10px',
    backgroundImage: chevronSvg,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    outline: 'none',
  }

  const subtleBg = t.isDark ? '#151928' : '#FAFAF8'
  const hoverBg = t.isDark ? '#1E2433' : '#F5F5F2'

  return (
    <div className="mb-6 animate-fade-in">
      {/* Filter row - stacks vertically on mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <SectionTitle>All Responses</SectionTitle>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value as ClientFilter)}
            className="w-full lg:w-auto"
            style={{ ...selectStyle, boxShadow: 'none' }}
            onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(216,192,122,0.2)' }}
            onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
          >
            <option value="all">All Status</option>
            <option value="client">Clients</option>
            <option value="prospect">Prospects</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value as UrgencyFilter)}
            className="w-full lg:w-auto"
            style={{ ...selectStyle, boxShadow: 'none' }}
            onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(216,192,122,0.2)' }}
            onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
          >
            <option value="all">All Urgency</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
          <div className="relative w-full lg:w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: t.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 transition-all focus:outline-none"
              style={{
                background: t.card,
                border: `1px solid ${inputBorder}`,
                color: t.text,
                fontFamily: C.fontBody,
                fontSize: '14px',
                borderRadius: '12px',
              }}
              onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(216,192,122,0.2)' }}
              onBlur={e => { e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          <button
            onClick={() => exportCSV(filtered)}
            className="w-full lg:w-auto px-4 py-2.5 transition-all duration-200"
            style={{
              fontFamily: C.fontHeading,
              fontWeight: 600,
              fontSize: '14px',
              background: 'transparent',
              color: C.accent,
              border: `1.5px solid ${C.accent}`,
              borderRadius: '12px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = '#FFFFFF' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.accent }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: '13px', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
                {['Name', 'Email', 'Client?', 'Urgency', 'Stance', 'Drive', 'Sentiment', 'Summary', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-4 uppercase tracking-widest sticky top-0 z-10"
                    style={{ fontSize: '11px', color: t.textMuted, fontFamily: C.fontHeading, fontWeight: 600, background: t.card }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center" style={{ color: t.textMuted, fontFamily: C.fontBody }}>No respondents found.</td></tr>
              ) : (
                filtered.map((lead, idx) => {
                  const junk = isJunkLead(lead)
                  const rowBg = idx % 2 === 0 ? t.card : subtleBg
                  return (
                  <Fragment key={lead.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                      className="cursor-pointer transition-colors duration-200"
                      style={{ borderBottom: `1px solid ${t.cardBorder}`, background: rowBg, opacity: junk ? 0.45 : 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = hoverBg }}
                      onMouseLeave={e => { e.currentTarget.style.background = rowBg }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: t.text, fontFamily: C.fontHeading, fontWeight: 600 }}>
                        {lead.name}
                        {junk && <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: t.isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6', color: t.isDark ? '#64748B' : '#9CA3AF', fontFamily: C.fontHeading, fontWeight: 500, fontSize: '10px' }}>TEST</span>}
                      </td>
                      <td className="px-4 py-4" style={{ color: t.textMuted, fontFamily: C.fontBody, fontSize: '12px' }}>{lead.email || '\u2014'}</td>
                      <td className="px-4 py-4"><ClientBadge isClient={lead.is_active_client} /></td>
                      <td className="px-4 py-4"><UrgencyBadge level={lead.urgency_level} /></td>
                      <td className="px-4 py-4"><StanceBadge stance={lead.stance} /></td>
                      <td className="px-4 py-4"><DriveTypeBadge driveType={lead.drive_type} /></td>
                      <td className="px-4 py-4">
                        <span style={{ fontFamily: C.fontHeading, fontWeight: 700, color: lead.sentiment_score >= 7 ? C.hot : lead.sentiment_score >= 4 ? C.warm : C.cold }}>
                          {lead.sentiment_score}
                        </span>
                        <span style={{ fontSize: '11px', color: t.textMuted }}>/10</span>
                      </td>
                      <td className="px-4 py-4 max-w-[180px] truncate" style={{ color: t.textMuted, fontFamily: C.fontBody, fontSize: '12px' }}>{lead.lead_summary}</td>
                      <td className="px-4 py-4 whitespace-nowrap" style={{ color: t.textMuted, fontFamily: C.fontBody, fontSize: '12px' }}>{fmtDate(lead.timestamp)}</td>
                      <td className="px-4 py-4">
                        <svg className={`w-4 h-4 transition-transform duration-200 ${expandedId === lead.id ? 'rotate-180' : ''}`} style={{ color: t.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </td>
                    </tr>
                    {expandedId === lead.id && (
                      <tr className="animate-fade-up">
                        <td colSpan={10} className="px-4 py-4" style={{ background: subtleBg }}>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <ExpandBlock label="Problem Description" text={lead.problem_description} color={C.hot} />
                            <ExpandBlock label="Lead Summary" text={lead.lead_summary} color={C.navy} />
                            <ExpandBlock label="Bottlenecks" text={lead.bottlenecks} color={C.warm} />
                            <ExpandBlock label="Fears" text={lead.fears} color="#A6809F" />
                            <ExpandBlock label="Desires" text={lead.desires} color="#8BA892" />
                            {lead.key_phrase && (
                              <div className="rounded-xl p-3.5" style={{ background: subtleBg, border: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${C.navy}` }}>
                                <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: t.isDark ? '#94A3B8' : C.navy, fontFamily: C.fontHeading, fontWeight: 600 }}>Key Phrase</p>
                                <p className="italic" style={{ fontFamily: C.fontBody, fontSize: '13px', color: t.text }}>&ldquo;{lead.key_phrase}&rdquo;</p>
                              </div>
                            )}
                            <ExpandBlock label="How They Define Success" text={lead.success_definition} color="#06b6d4" />
                            <ExpandBlock label="Identity Transformation" text={lead.identity_transformation} color="#8BA892" />
                            <ExpandBlock label="Past Investment" text={lead.past_investment} color={C.warm} />

                            <div className="rounded-xl p-3.5" style={{ background: subtleBg, border: `1px solid ${t.cardBorder}` }}>
                              <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: t.textMuted, fontFamily: C.fontHeading, fontWeight: 600 }}>Profile</p>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <StanceBadge stance={lead.stance} />
                                <DriveTypeBadge driveType={lead.drive_type} />
                              </div>
                              <p style={{ fontFamily: C.fontBody, fontSize: '12px', color: t.body }}>Core Motivation: <strong>{lead.core_motivation}</strong></p>
                              <p style={{ fontFamily: C.fontBody, fontSize: '12px', color: t.body }}>Sentiment: <strong>{lead.sentiment_score}/10</strong></p>
                              <p style={{ fontFamily: C.fontBody, fontSize: '12px', color: t.body }}>Submitted: {fmtDate(lead.timestamp)}</p>
                            </div>

                            {lead.identity_tags.length > 0 && (
                              <div className="rounded-xl p-3.5" style={{ background: subtleBg, border: `1px solid ${t.cardBorder}` }}>
                                <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: '#7C3AED', fontFamily: C.fontHeading, fontWeight: 600 }}>Identity Tags</p>
                                <div className="flex flex-wrap gap-2">
                                  {lead.identity_tags.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-full"
                                      style={{ background: t.card, border: `1px solid ${t.cardBorder}`, fontFamily: C.fontHeading, fontSize: '12px', fontWeight: 500, color: t.text }}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {lead.sales_strategy && (
                              <div className="col-span-1 lg:col-span-2 rounded-xl p-4"
                                style={{
                                  background: t.isDark ? 'rgba(216,192,122,0.08)' : 'linear-gradient(135deg, rgba(216,192,122,0.06), rgba(216,192,122,0.12))',
                                  borderLeft: `3px solid ${C.accent}`,
                                  boxShadow: 'inset 0 1px 3px rgba(216,192,122,0.08)',
                                }}>
                                <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color: C.accent, fontFamily: C.fontHeading, fontWeight: 600 }}>Sales Playbook</p>
                                <p style={{ fontFamily: C.fontBody, fontSize: '13.5px', color: t.text, lineHeight: '1.6' }}>{lead.sales_strategy}</p>
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
        </div>
      </Card>
    </div>
  )
}
