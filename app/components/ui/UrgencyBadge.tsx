'use client'

import { C } from '@/lib/constants'

export function UrgencyBadge({ level }: { level: string }) {
  const cfg: Record<string, { bg: string; text: string; border: string }> = {
    Hot: { bg: C.hotBg, text: C.hot, border: C.hotBorder },
    Warm: { bg: C.warmBg, text: '#B45309', border: C.warmBorder },
    Cold: { bg: C.coldBg, text: C.cold, border: C.coldBorder },
  }
  const icons: Record<string, string> = { Hot: '\u{1F525}', Warm: '\u26A1', Cold: '\u2744\uFE0F' }
  const c = cfg[level] || cfg.Cold
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {icons[level]} {level}
    </span>
  )
}
