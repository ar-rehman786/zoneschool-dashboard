'use client'

import { C } from '@/lib/constants'

export function ExpandBlock({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: '#F8FAFC', border: `1px solid ${C.cardBorder}` }}>
      <p className="font-bold uppercase tracking-widest mb-1.5" style={{ fontSize: '0.7rem', color }}>{label}</p>
      <p className="text-xs leading-relaxed" style={{ color: C.text }}>{text || '\u2014'}</p>
    </div>
  )
}
