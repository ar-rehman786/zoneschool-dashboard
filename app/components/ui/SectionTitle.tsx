'use client'

import { C } from '@/lib/constants'
import { useTheme } from '@/lib/theme'

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const t = useTheme()
  return <h2 className="text-xl font-semibold mb-4" style={{ color: t.text, fontFamily: C.fontHeading, fontSize: '20px', fontWeight: 600 }}>{children}</h2>
}
