'use client'

import { C } from '@/lib/constants'

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold mb-4" style={{ color: C.text, fontFamily: C.fontHeading, fontSize: '20px', fontWeight: 600 }}>{children}</h2>
}
