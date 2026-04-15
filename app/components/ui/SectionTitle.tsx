'use client'

import { C } from '@/lib/constants'

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold mb-4" style={{ color: C.text, fontFamily: 'Lexend, sans-serif' }}>{children}</h2>
}
