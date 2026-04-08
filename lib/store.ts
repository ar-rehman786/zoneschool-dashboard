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

// ─── GHL API Configuration ───
const GHL_API_KEY = process.env.GHL_API_KEY || ''
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || ''
const GHL_BASE_URL = 'https://services.leadconnectorhq.com'

function ghlHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${GHL_API_KEY}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  }
}

// ─── Custom field key mapping ───
// GHL returns custom fields with "contact.zs_*" keys in GET responses,
// but the PUT /contacts/:id endpoint expects just "zs_*" keys.
const FIELD_KEYS = [
  'zs_urgency_level',
  'zs_sentiment_score',
  'zs_market_readiness',
  'zs_problem_description',
  'zs_bottlenecks',
  'zs_fears',
  'zs_desires',
  'zs_past_investment',
  'zs_tried_before',
  'zs_success_definition',
  'zs_identity_transformation',
  'zs_service_preference',
  'zs_lead_summary',
  'zs_key_phrase',
  'zs_analyzed_at',
] as const

// Write keys: used in PUT body  →  "zs_*"
const WRITE_KEY: Record<string, string> = Object.fromEntries(
  FIELD_KEYS.map(k => [k, k]),
)

// Read keys: used to find values in GET response  →  "contact.zs_*"
const READ_KEY: Record<string, string> = Object.fromEntries(
  FIELD_KEYS.map(k => [k, `contact.${k}`]),
)

// ─── GHL API: Update contact custom fields ───
export async function updateContactCustomFields(
  contactId: string,
  data: Partial<Omit<Lead, 'id' | 'name' | 'email' | 'timestamp'>>,
): Promise<{ success: boolean; error?: string }> {
  const customFields: Array<{ key: string; field_value: string }> = []

  if (data.urgency_level) customFields.push({ key: WRITE_KEY.zs_urgency_level, field_value: data.urgency_level })
  if (data.sentiment_score !== undefined) customFields.push({ key: WRITE_KEY.zs_sentiment_score, field_value: String(data.sentiment_score) })
  if (data.market_readiness) customFields.push({ key: WRITE_KEY.zs_market_readiness, field_value: data.market_readiness })
  if (data.problem_description) customFields.push({ key: WRITE_KEY.zs_problem_description, field_value: data.problem_description })
  if (data.bottlenecks) customFields.push({ key: WRITE_KEY.zs_bottlenecks, field_value: data.bottlenecks })
  if (data.fears) customFields.push({ key: WRITE_KEY.zs_fears, field_value: data.fears })
  if (data.desires) customFields.push({ key: WRITE_KEY.zs_desires, field_value: data.desires })
  if (data.past_investment) customFields.push({ key: WRITE_KEY.zs_past_investment, field_value: data.past_investment })
  if (data.tried_before) customFields.push({ key: WRITE_KEY.zs_tried_before, field_value: data.tried_before })
  if (data.success_definition) customFields.push({ key: WRITE_KEY.zs_success_definition, field_value: data.success_definition })
  if (data.identity_transformation) customFields.push({ key: WRITE_KEY.zs_identity_transformation, field_value: data.identity_transformation })
  if (data.service_preference) customFields.push({ key: WRITE_KEY.zs_service_preference, field_value: data.service_preference })
  if (data.lead_summary) customFields.push({ key: WRITE_KEY.zs_lead_summary, field_value: data.lead_summary })
  if (data.key_phrase) customFields.push({ key: WRITE_KEY.zs_key_phrase, field_value: data.key_phrase })

  // Always set analyzed_at timestamp
  customFields.push({ key: WRITE_KEY.zs_analyzed_at, field_value: new Date().toISOString() })

  const res = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
    method: 'PUT',
    headers: ghlHeaders(),
    body: JSON.stringify({ customFields }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    return { success: false, error: `GHL API error ${res.status}: ${errBody}` }
  }

  return { success: true }
}

// ─── GHL API: Fetch all analyzed contacts ───
interface GHLContact {
  id: string
  contactName?: string
  firstName?: string
  lastName?: string
  email?: string
  customFields?: Array<{ id: string; key?: string; field_value?: string; value?: string }>
  dateAdded?: string
}

function getCustomFieldValue(contact: GHLContact, fieldKey: string): string {
  if (!contact.customFields) return ''
  const cf = contact.customFields.find(f => f.key === fieldKey)
  return cf?.field_value ?? cf?.value ?? ''
}

function contactToLead(contact: GHLContact): Lead {
  const name = contact.contactName || [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown'
  const urgencyRaw = getCustomFieldValue(contact, READ_KEY.zs_urgency_level)
  const urgency = (['Hot', 'Warm', 'Cold'].includes(urgencyRaw) ? urgencyRaw : 'Cold') as Lead['urgency_level']
  const readinessRaw = getCustomFieldValue(contact, READ_KEY.zs_market_readiness)
  const readiness = (['Done-For-You', 'DIY', 'Hybrid'].includes(readinessRaw) ? readinessRaw : 'Hybrid') as Lead['market_readiness']

  return {
    id: contact.id,
    name,
    email: contact.email || '',
    urgency_level: urgency,
    sentiment_score: Number(getCustomFieldValue(contact, READ_KEY.zs_sentiment_score)) || 0,
    market_readiness: readiness,
    problem_description: getCustomFieldValue(contact, READ_KEY.zs_problem_description),
    bottlenecks: getCustomFieldValue(contact, READ_KEY.zs_bottlenecks),
    fears: getCustomFieldValue(contact, READ_KEY.zs_fears),
    desires: getCustomFieldValue(contact, READ_KEY.zs_desires),
    past_investment: getCustomFieldValue(contact, READ_KEY.zs_past_investment),
    tried_before: getCustomFieldValue(contact, READ_KEY.zs_tried_before),
    success_definition: getCustomFieldValue(contact, READ_KEY.zs_success_definition),
    identity_transformation: getCustomFieldValue(contact, READ_KEY.zs_identity_transformation),
    service_preference: getCustomFieldValue(contact, READ_KEY.zs_service_preference),
    lead_summary: getCustomFieldValue(contact, READ_KEY.zs_lead_summary),
    key_phrase: getCustomFieldValue(contact, READ_KEY.zs_key_phrase),
    timestamp: getCustomFieldValue(contact, READ_KEY.zs_analyzed_at) || contact.dateAdded || new Date().toISOString(),
  }
}

export async function fetchAnalyzedLeads(): Promise<Lead[]> {
  const leads: Lead[] = []
  let startAfterId: string | undefined
  let hasMore = true

  while (hasMore) {
    const params = new URLSearchParams({ locationId: GHL_LOCATION_ID, limit: '100' })
    if (startAfterId) params.set('startAfterId', startAfterId)

    const res = await fetch(`${GHL_BASE_URL}/contacts/?${params.toString()}`, {
      method: 'GET',
      headers: ghlHeaders(),
    })

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`GHL API error ${res.status}: ${errBody}`)
    }

    const data = await res.json()
    const contacts: GHLContact[] = data.contacts || []

    for (const contact of contacts) {
      const urgencyVal = getCustomFieldValue(contact, READ_KEY.zs_urgency_level)
      if (urgencyVal) {
        leads.push(contactToLead(contact))
      }
    }

    if (contacts.length < 100) {
      hasMore = false
    } else {
      startAfterId = contacts[contacts.length - 1].id
    }
  }

  return leads
}

// ─── Analysis helpers (operate on a leads array) ───

/** Split semicolon/newline-separated text into trimmed phrases */
function splitPhrases(text: string): string[] {
  return text.split(/[;\n]/).map(s => s.trim()).filter(Boolean)
}

export function getHotLeads(leads: Lead[]): Lead[] {
  return leads.filter(l => l.urgency_level === 'Hot')
}

export function getWarmLeads(leads: Lead[]): Lead[] {
  return leads.filter(l => l.urgency_level === 'Warm')
}

export function getColdLeads(leads: Lead[]): Lead[] {
  return leads.filter(l => l.urgency_level === 'Cold')
}

export function getAverageSentiment(leads: Lead[]): number {
  if (leads.length === 0) return 0
  return leads.reduce((sum, l) => sum + l.sentiment_score, 0) / leads.length
}

export function getTopBottlenecks(leads: Lead[]): Array<{ text: string; count: number }> {
  const map: Record<string, number> = {}
  leads.forEach(l => {
    splitPhrases(l.bottlenecks).forEach(p => {
      map[p] = (map[p] || 0) + 1
    })
  })
  return Object.entries(map)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
}

export function getMarketReadinessBreakdown(leads: Lead[]): { dfy: number; diy: number; hybrid: number } {
  return {
    dfy: leads.filter(l => l.market_readiness === 'Done-For-You').length,
    diy: leads.filter(l => l.market_readiness === 'DIY').length,
    hybrid: leads.filter(l => l.market_readiness === 'Hybrid').length,
  }
}

export function getKeyPhrases(leads: Lead[]): string[] {
  return leads.map(l => l.key_phrase).filter(Boolean)
}

export function getMarketFitLanguage(leads: Lead[]): {
  problems: string[]
  bottlenecks: string[]
  fears: string[]
  desires: string[]
} {
  const collect = (field: keyof Pick<Lead, 'problem_description' | 'bottlenecks' | 'fears' | 'desires'>) => {
    const seen = new Set<string>()
    const result: string[] = []
    leads.forEach(l => {
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
