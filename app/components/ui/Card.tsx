'use client'

import { useTheme } from '@/lib/theme'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const t = useTheme()
  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-200 ${className}`}
      style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
    >
      {children}
    </div>
  )
}
