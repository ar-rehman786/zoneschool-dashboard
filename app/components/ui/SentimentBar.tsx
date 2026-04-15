'use client'

import { C } from '@/lib/constants'

export function SentimentBar({ score }: { score: number }) {
  const color = score >= 7 ? C.hot : score >= 4 ? C.warm : C.cold
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score * 10}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}/10</span>
    </div>
  )
}
