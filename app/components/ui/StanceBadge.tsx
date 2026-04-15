'use client'

import { C } from '@/lib/constants'

export function StanceBadge({ stance }: { stance: 'Committed' | 'Skeptical' | 'Burned' }) {
  const cfg: Record<string, { bg: string; text: string; border: string }> = {
    Committed: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
    Skeptical: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    Burned: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
  }
  const c = cfg[stance] || cfg.Committed
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border"
      style={{ background: c.bg, color: c.text, borderColor: c.border, fontFamily: C.fontHeading, fontWeight: 600, fontSize: '12px' }}>
      {stance}
    </span>
  )
}
