import type { Lead } from './types'

export function splitPhrases(text: string): string[] {
  return text.split(/[;\n]/).map(s => s.trim()).filter(Boolean)
}

export function collectUnique(leads: Lead[], field: keyof Lead): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  leads.forEach(l => {
    splitPhrases(String(l[field])).forEach(p => {
      const k = p.toLowerCase()
      if (!seen.has(k)) { seen.add(k); result.push(p) }
    })
  })
  return result
}

export function countPhrases(leads: Lead[], field: keyof Lead): Array<{ text: string; count: number }> {
  const map: Record<string, number> = {}
  leads.forEach(l => {
    splitPhrases(String(l[field])).forEach(p => { map[p] = (map[p] || 0) + 1 })
  })
  return Object.entries(map)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
}

export function pct(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0
}

export function fmtDate(ts: string): string {
  try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return ts }
}
