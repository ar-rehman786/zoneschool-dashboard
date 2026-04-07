import { NextRequest, NextResponse } from 'next/server'
import { getLeads, addLead } from '@/lib/store'

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
    const created: string[] = []

    for (const item of items) {
      const r = item as Record<string, unknown>

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

      const lead = addLead({
        urgency_level: urgency as 'Hot' | 'Warm' | 'Cold',
        sentiment_score: Number(r.sentiment_score),
        problem_description: String(r.problem_description || ''),
        bottlenecks: String(r.bottlenecks || ''),
        fears: String(r.fears || ''),
        desires: String(r.desires || ''),
        lead_summary: String(r.lead_summary || ''),
        timestamp: String(r.timestamp || new Date().toISOString()),
        name: String(r.name || 'Anonymous'),
        email: String(r.email || ''),
        market_readiness,
        past_investment: String(r.past_investment || ''),
        tried_before: String(r.tried_before || ''),
        success_definition: String(r.success_definition || ''),
        identity_transformation: String(r.identity_transformation || ''),
        service_preference: String(r.service_preference || ''),
        key_phrase: String(r.key_phrase || ''),
      })
      created.push(lead.id)
    }

    return NextResponse.json(
      { success: true, count: created.length, ids: created },
      { status: 201, headers: corsHeaders },
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to process lead data' },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function GET() {
  return NextResponse.json({ leads: getLeads() }, { headers: corsHeaders })
}
