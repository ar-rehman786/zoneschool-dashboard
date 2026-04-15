'use client'

import { C } from '@/lib/constants'

export function UrgencyBadge({ level }: { level: string }) {
  const cfg: Record<string, { bg: string; text: string; border: string }> = {
    Hot: { bg: C.hotBg, text: C.hot, border: C.hotBorder },
    Warm: { bg: C.warmBg, text: '#B45309', border: C.warmBorder },
    Cold: { bg: C.coldBg, text: C.cold, border: C.coldBorder },
  }
  const c = cfg[level] || cfg.Cold
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border"
      style={{ background: c.bg, color: c.text, borderColor: c.border, fontFamily: C.fontHeading, fontWeight: 600, fontSize: '12px' }}>
      {level}
    </span>
  )
}
