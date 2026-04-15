'use client'

import { C } from '@/lib/constants'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-[20px] p-6 transition-all duration-200 ${className}`}
      style={{ border: `1px solid ${C.cardBorder}`, boxShadow: C.cardShadow }}
    >
      {children}
    </div>
  )
}
