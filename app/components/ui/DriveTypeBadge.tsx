'use client'

import { C, DRIVE_COLORS } from '@/lib/constants'

export function DriveTypeBadge({ driveType }: { driveType: 'Healer' | 'Builder' | 'Teacher' }) {
  const cfg: Record<string, { bg: string; text: string; border: string }> = {
    Healer: { bg: '#CCFBF1', text: '#115E59', border: '#99F6E4' },
    Builder: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
    Teacher: { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' },
  }
  const c = cfg[driveType] || cfg.Healer
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border"
      style={{ background: c.bg, color: c.text, borderColor: c.border, fontFamily: C.fontHeading, fontWeight: 600, fontSize: '12px' }}>
      {driveType}
    </span>
  )
}

export { DRIVE_COLORS }
