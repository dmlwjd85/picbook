import { formatTypingStatsLine, type TypingStatsSnapshot } from '../lib/typingStats'

type Props = {
  stats: TypingStatsSnapshot
  /** immersive 연출 위 어두운 배경 */
  variant?: 'light' | 'dark'
  className?: string
}

/** 타이핑 속도·정확도 표시 */
export function TypingStatsBar({ stats, variant = 'light', className = '' }: Props) {
  if (stats.keystrokes === 0) return null

  const line = formatTypingStatsLine(stats)
  const detail = `${stats.elapsedSec}초 · ${stats.typedChars}/${stats.targetChars}자`

  const isDark = variant === 'dark'

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center ${
        isDark
          ? 'rounded-lg bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-amber-100/95 backdrop-blur-sm'
          : 'text-[11px] font-semibold text-stone-600 sm:text-xs'
      } ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={isDark ? 'text-amber-50' : 'text-stone-800'}>{line}</span>
      <span className={isDark ? 'text-white/55' : 'text-stone-400'}>{detail}</span>
    </div>
  )
}
