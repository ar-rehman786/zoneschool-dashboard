// ─── Lead type matching N8N webhook payload ───
export interface Lead {
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

// ─── Module-level in-memory store (persists between API calls) ───
const g = globalThis as unknown as { __zs_leads: Lead[] }
if (!g.__zs_leads) g.__zs_leads = []

export function getLeads(): Lead[] {
  return g.__zs_leads
}

export function addLead(data: Partial<Omit<Lead, 'id'>> & Pick<Lead, 'urgency_level' | 'sentiment_score' | 'problem_description' | 'bottlenecks' | 'fears' | 'desires' | 'lead_summary' | 'timestamp' | 'name' | 'email'>): Lead {
  const lead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    market_readiness: data.market_readiness || 'Hybrid',
    past_investment: data.past_investment || '',
    tried_before: data.tried_before || '',
    success_definition: data.success_definition || '',
    identity_transformation: data.identity_transformation || '',
    service_preference: data.service_preference || '',
    key_phrase: data.key_phrase || '',
    ...data,
  }
  g.__zs_leads.push(lead)
  return lead
}

// ─── Helpers ───
export function getHotLeads(): Lead[] {
  return g.__zs_leads.filter(l => l.urgency_level === 'Hot')
}

export function getWarmLeads(): Lead[] {
  return g.__zs_leads.filter(l => l.urgency_level === 'Warm')
}

export function getColdLeads(): Lead[] {
  return g.__zs_leads.filter(l => l.urgency_level === 'Cold')
}

export function getAverageSentiment(): number {
  const leads = g.__zs_leads
  if (leads.length === 0) return 0
  return leads.reduce((sum, l) => sum + l.sentiment_score, 0) / leads.length
}

/** Split semicolon/newline-separated text into trimmed phrases */
function splitPhrases(text: string): string[] {
  return text.split(/[;\n]/).map(s => s.trim()).filter(Boolean)
}

/** Count phrase occurrences across all leads for a given field */
export function getTopBottlenecks(): Array<{ text: string; count: number }> {
  const map: Record<string, number> = {}
  g.__zs_leads.forEach(l => {
    splitPhrases(l.bottlenecks).forEach(p => {
      map[p] = (map[p] || 0) + 1
    })
  })
  return Object.entries(map)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
}

export function getMarketReadinessBreakdown(): { dfy: number; diy: number; hybrid: number } {
  const leads = g.__zs_leads
  return {
    dfy: leads.filter(l => l.market_readiness === 'Done-For-You').length,
    diy: leads.filter(l => l.market_readiness === 'DIY').length,
    hybrid: leads.filter(l => l.market_readiness === 'Hybrid').length,
  }
}

export function getKeyPhrases(): string[] {
  return g.__zs_leads.map(l => l.key_phrase).filter(Boolean)
}

/** Collect unique phrases from a field across all leads */
export function getMarketFitLanguage(): {
  problems: string[]
  bottlenecks: string[]
  fears: string[]
  desires: string[]
} {
  const collect = (field: keyof Pick<Lead, 'problem_description' | 'bottlenecks' | 'fears' | 'desires'>) => {
    const seen = new Set<string>()
    const result: string[] = []
    g.__zs_leads.forEach(l => {
      splitPhrases(l[field]).forEach(phrase => {
        const key = phrase.toLowerCase()
        if (!seen.has(key)) { seen.add(key); result.push(phrase) }
      })
    })
    return result
  }
  return {
    problems: collect('problem_description'),
    bottlenecks: collect('bottlenecks'),
    fears: collect('fears'),
    desires: collect('desires'),
  }
}
