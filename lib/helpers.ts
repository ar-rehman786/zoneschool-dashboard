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

const JUNK_PHRASE_PATTERN = /not provided|n\/a|unknown|insufficient|unable to determine|none|i don'?t know|no authentic data|no specific/i

export function isJunkPhrase(text: string): boolean {
  return JUNK_PHRASE_PATTERN.test(text)
}

const JUNK_NAME_PATTERNS = ['test', 'n/a', 'nbnbbn', 'abdulll', 'testtt', 'testft']

export function isJunkLead(lead: Lead): boolean {
  const nameLower = lead.name.toLowerCase().trim()
  const emailLower = lead.email.toLowerCase().trim()

  if (JUNK_NAME_PATTERNS.some(p => nameLower.includes(p))) return true
  if (JUNK_NAME_PATTERNS.some(p => emailLower.includes(p))) return true

  const substantiveFields = [lead.problem_description, lead.fears, lead.desires, lead.success_definition]
  const allEmpty = substantiveFields.every(f =>
    !f || f.toLowerCase().trim() === 'n/a' || f.toLowerCase().trim() === 'not provided' || f.trim() === ''
  )
  if (allEmpty) return true

  return false
}

const VALID_IDENTITY_TAGS = new Set([
  'helper', 'purpose-driven', 'growth', 'achievement', 'family-centered',
  'practice-as-self', 'trusted guide', 'values-led', 'stewardship', 'legacy',
])

export function isValidIdentityTag(tag: string): boolean {
  return VALID_IDENTITY_TAGS.has(tag.toLowerCase().trim())
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
