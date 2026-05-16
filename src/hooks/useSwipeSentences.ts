import { useRef, useCallback } from 'react'

type Options = {
  onPrev: () => void
  onNext: () => void
  /** 최소 스와이프 거리(px) */
  threshold?: number
}

/** 모바일: 좌우 스와이프로 이전·다음 문장 */
export function useSwipeSentences({ onPrev, onNext, threshold = 56 }: Options) {
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    startRef.current = { x: t.clientX, y: t.clientY }
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = startRef.current
      startRef.current = null
      if (!start) return
      const t = e.changedTouches[0]
      if (!t) return
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.2) return
      if (dx < 0) onNext()
      else onPrev()
    },
    [onNext, onPrev, threshold],
  )

  return { onTouchStart, onTouchEnd }
}
