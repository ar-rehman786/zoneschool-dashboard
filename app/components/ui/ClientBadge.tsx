'use client'

import { C } from '@/lib/constants'

export function ClientBadge({ isClient }: { isClient: boolean }) {
  return isClient ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border"
      style={{ background: '#FEF9C3', color: '#854D0E', borderColor: '#FDE047', fontFamily: C.fontHeading, fontWeight: 600, fontSize: '12px' }}>
      Client
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border"
      style={{ background: '#F1F5F9', color: '#64748B', borderColor: '#E2E8F0', fontFamily: C.fontHeading, fontWeight: 600, fontSize: '12px' }}>
      Prospect
    </span>
  )
}
