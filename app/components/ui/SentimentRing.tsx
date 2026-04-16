'use client'

import { C } from '@/lib/constants'
import { useTheme } from '@/lib/theme'

export function SentimentRing({ score, size = 40 }: { score: number; size?: number }) {
  const t = useTheme()
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const color = score >= 7 ? C.hot : score >= 4 ? C.warm : C.cold

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={t.isDark ? '#2A3142' : '#F1F5F9'} strokeWidth={3} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-xs font-semibold" style={{ color, fontFamily: C.fontHeading, fontSize: size * 0.28 }}>{score}</span>
    </div>
  )
}
