// ─── Lead type matching the dashboard interface ───
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

// ─── GHL API helpers ───

function ghlHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  }
}

interface GHLCustomField {
  id: string
  key?: string
  field_value?: string
  value?: string
}

interface GHLContact {
  id: string
  contactName?: string
  firstName?: string
  lastName?: string
  email?: string
  customFields?: GHLCustomField[]
  dateAdded?: string
}

function getCustomField(contact: GHLContact, key: string): string {
  if (!contact.customFields) return ''
  const cf = contact.customFields.find(f => f.key === key)
  return cf?.field_value ?? cf?.value ?? ''
}

function contactToLead(contact: GHLContact): Lead {
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.contactName || 'Unknown'

  const urgencyRaw = getCustomField(contact, 'zs_urgency_level')
  const urgency = (['Hot', 'Warm', 'Cold'].includes(urgencyRaw) ? urgencyRaw : 'Cold') as Lead['urgency_level']

  const readinessRaw = getCustomField(contact, 'zs_market_readiness')
  const readiness = (['Done-For-You', 'DIY', 'Hybrid'].includes(readinessRaw) ? readinessRaw : 'Hybrid') as Lead['market_readiness']

  return {
    id: contact.id,
    name,
    email: contact.email || '',
    urgency_level: urgency,
    sentiment_score: Number(getCustomField(contact, 'zs_sentiment_score')) || 0,
    market_readiness: readiness,
    problem_description: getCustomField(contact, 'zs_problem_description'),
    bottlenecks: getCustomField(contact, 'zs_bottlenecks'),
    fears: getCustomField(contact, 'zs_fears'),
    desires: getCustomField(contact, 'zs_desires'),
    past_investment: getCustomField(contact, 'zs_past_investment'),
    tried_before: getCustomField(contact, 'zs_tried_before'),
    success_definition: getCustomField(contact, 'zs_success_definition'),
    identity_transformation: getCustomField(contact, 'zs_identity_transformation'),
    service_preference: getCustomField(contact, 'zs_service_preference'),
    lead_summary: getCustomField(contact, 'zs_lead_summary'),
    key_phrase: getCustomField(contact, 'zs_key_phrase'),
    timestamp: contact.dateAdded || new Date().toISOString(),
  }
}

// ─── Fetch all analyzed contacts from GHL ───
export async function fetchAnalyzedLeads(): Promise<Lead[]> {
  const locationId = process.env.GHL_LOCATION_ID
  if (!locationId) {
    console.error('[store] GHL_LOCATION_ID is not set!')
    return []
  }

  const leads: Lead[] = []
  let hasMore = true
  let startAfterId = ''
  let startAfter = ''

  while (hasMore) {
    const params = new URLSearchParams({
      locationId,
      limit: '100',
    })

    if (startAfterId && startAfter) {
      params.set('startAfterId', startAfterId)
      params.set('startAfter', startAfter)
    }

    const res = await fetch(
      `https://services.leadconnectorhq.com/contacts/?${params.toString()}`,
      {
        method: 'GET',
        headers: ghlHeaders(),
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      console.error(`[store] GHL contacts error ${res.status}: ${errBody}`)
      throw new Error(`GHL API error ${res.status}: ${errBody}`)
    }

    const data = await res.json()
    const contacts: GHLContact[] = data.contacts || []

    for (const contact of contacts) {
      const urgencyVal = getCustomField(contact, 'zs_urgency_level')
      if (urgencyVal) {
        leads.push(contactToLead(contact))
      }
    }

    if (data.meta?.startAfterId && data.meta?.startAfter) {
      startAfterId = data.meta.startAfterId
      startAfter = String(data.meta.startAfter)
    } else {
      hasMore = false
    }
  }

  console.log(`[store] Fetched ${leads.length} analyzed leads from GHL`)
  return leads
}
