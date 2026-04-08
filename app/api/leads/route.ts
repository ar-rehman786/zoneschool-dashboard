import { NextRequest, NextResponse } from 'next/server'
import { fetchAnalyzedLeads } from '@/lib/store'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// In-memory store as fallback
const leadsStore: Record<string, Record<string, unknown>> = {}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items: unknown[] = Array.isArray(body) ? body : [body]
    const results: Array<{ contact_id: string; ghl_status: number | null; ghl_synced: boolean }> = []

    for (const item of items) {
      const r = item as Record<string, unknown>

      const contact_id = r.contact_id ? String(r.contact_id) : null
      const urgency_level = String(r.urgency_level || 'Cold')
      const sentiment_score = String(r.sentiment_score ?? '0')
      const market_readiness = String(r.market_readiness || 'Hybrid')
      const problem_description = String(r.problem_description || '')
      const bottlenecks = String(r.bottlenecks || '')
      const fears = String(r.fears || '')
      const desires = String(r.desires || '')
      const past_investment = String(r.past_investment || '')
      const tried_before = String(r.tried_before || '')
      const success_definition = String(r.success_definition || '')
      const identity_transformation = String(r.identity_transformation || '')
      const service_preference = String(r.service_preference || '')
      const lead_summary = String(r.lead_summary || '')
      const key_phrase = String(r.key_phrase || '')

      // 1. Save to in-memory store as fallback
      const storeKey = contact_id || `lead_${Date.now()}`
      leadsStore[storeKey] = { ...r, stored_at: new Date().toISOString() }
      console.log(`[leads] Saved to in-memory store: ${storeKey}`)

      // 2. If contact_id exists, make PUT call to GHL
      let ghlStatus: number | null = null
      let ghlSynced = false

      if (contact_id) {
        try {
          console.log(`[leads] Updating GHL contact: ${contact_id}`)

          const ghlResponse = await fetch(
            `https://services.leadconnectorhq.com/contacts/${contact_id}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                customFields: [
                  { key: 'zs_urgency_level', field_value: urgency_level },
                  { key: 'zs_sentiment_score', field_value: sentiment_score },
                  { key: 'zs_market_readiness', field_value: market_readiness },
                  { key: 'zs_problem_description', field_value: problem_description },
                  { key: 'zs_bottlenecks', field_value: bottlenecks },
                  { key: 'zs_fears', field_value: fears },
                  { key: 'zs_desires', field_value: desires },
                  { key: 'zs_past_investment', field_value: past_investment },
                  { key: 'zs_tried_before', field_value: tried_before },
                  { key: 'zs_success_definition', field_value: success_definition },
                  { key: 'zs_identity_transformation', field_value: identity_transformation },
                  { key: 'zs_service_preference', field_value: service_preference },
                  { key: 'zs_lead_summary', field_value: lead_summary },
                  { key: 'zs_key_phrase', field_value: key_phrase },
                  { key: 'zs_analyzed_at', field_value: new Date().toISOString() },
                ],
              }),
            },
          )

          ghlStatus = ghlResponse.status
          const ghlBody = await ghlResponse.text()
          console.log(`[leads] GHL response status: ${ghlStatus}`)
          console.log(`[leads] GHL response body: ${ghlBody}`)

          ghlSynced = ghlResponse.ok
        } catch (ghlErr) {
          console.error(`[leads] GHL API call failed for ${contact_id}:`, ghlErr)
        }
      } else {
        console.log('[leads] No contact_id provided — skipped GHL update')
      }

      results.push({ contact_id: storeKey, ghl_status: ghlStatus, ghl_synced: ghlSynced })
    }

    return NextResponse.json(
      { success: true, count: results.length, results },
      { status: 200, headers: corsHeaders },
    )
  } catch (err) {
    console.error('[leads] POST handler error:', err)
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
