'use client'

import { C } from '@/lib/constants'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={{ border: `1px solid ${C.cardBorder}`, boxShadow: C.cardShadow }}
    >
      {children}
    </div>
  )
}
