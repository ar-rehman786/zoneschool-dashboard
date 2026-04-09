import { NextResponse } from 'next/server'
import { fetchAnalyzedLeads } from '@/lib/store'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders })
}

export async function GET() {
  try {
    const leads = await fetchAnalyzedLeads()
    return NextResponse.json({ leads }, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leads from GHL' },
      { status: 502, headers: corsHeaders },
    )
  }
}
