import { NextRequest, NextResponse } from 'next/server'
import { fetchAnalyzedLeads, updateContactCustomFields } from '@/lib/store'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items: unknown[] = Array.isArray(body) ? body : [body]
    const updated: string[] = []

    for (const item of items) {
      const r = item as Record<string, unknown>

      // contact_id is required to update a GHL contact
      if (!r.contact_id) {
        return NextResponse.json(
          { error: 'Missing required field: contact_id' },
          { status: 400, headers: corsHeaders },
        )
      }

      const required = ['urgency_level', 'sentiment_score', 'problem_description', 'bottlenecks', 'fears', 'desires', 'lead_summary']
      const missing = required.filter(f => r[f] === undefined || r[f] === null)
      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Missing required fields: ${missing.join(', ')}` },
          { status: 400, headers: corsHeaders },
        )
      }

      const urgency = String(r.urgency_level)
      if (!['Hot', 'Warm', 'Cold'].includes(urgency)) {
        return NextResponse.json(
          { error: 'urgency_level must be Hot, Warm, or Cold' },
          { status: 400, headers: corsHeaders },
        )
      }

      const rawReadiness = String(r.market_readiness || '')
      const validReadiness = ['Done-For-You', 'DIY', 'Hybrid']
      const market_readiness = (validReadiness.includes(rawReadiness) ? rawReadiness : 'Hybrid') as 'Done-For-You' | 'DIY' | 'Hybrid'

      const contactId = String(r.contact_id)
      const result = await updateContactCustomFields(contactId, {
        urgency_level: urgency as 'Hot' | 'Warm' | 'Cold',
        sentiment_score: Number(r.sentiment_score),
        problem_description: String(r.problem_description || ''),
        bottlenecks: String(r.bottlenecks || ''),
        fears: String(r.fears || ''),
        desires: String(r.desires || ''),
        lead_summary: String(r.lead_summary || ''),
        market_readiness,
        past_investment: String(r.past_investment || ''),
        tried_before: String(r.tried_before || ''),
        success_definition: String(r.success_definition || ''),
        identity_transformation: String(r.identity_transformation || ''),
        service_preference: String(r.service_preference || ''),
        key_phrase: String(r.key_phrase || ''),
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 502, headers: corsHeaders },
        )
      }

      updated.push(contactId)
    }

    return NextResponse.json(
      { success: true, count: updated.length, contact_ids: updated },
      { status: 200, headers: corsHeaders },
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to process lead data' },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function GET() {
  try {
    const leads = await fetchAnalyzedLeads()
    return NextResponse.json({ leads }, { headers: corsHeaders })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leads from GHL' },
      { status: 502, headers: corsHeaders },
    )
  }
}
