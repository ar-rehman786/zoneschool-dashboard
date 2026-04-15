'use client'

import { C } from '@/lib/constants'

export function ExpandBlock({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: '#FAFAF8', border: `1px solid ${C.cardBorder}` }}>
      <p className="uppercase tracking-widest mb-1.5" style={{ fontSize: '11px', color, fontFamily: C.fontHeading, fontWeight: 600 }}>{label}</p>
      <p className="leading-relaxed" style={{ color: C.body, fontFamily: C.fontBody, fontSize: '13px' }}>{text || '\u2014'}</p>
    </div>
  )
}
