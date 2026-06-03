import { useEffect, useMemo, useRef, useState } from 'react'
import {
  computeTypingStats,
  createTypingStatsAccumulator,
  recordDraftDelta,
  type TypingStatsAccumulator,
  type TypingStatsSnapshot,
} from '../lib/typingStats'

type Options = {
  target: string
  draft: string
  typed: string
  /** 문장·책 전환 시 초기화 */
  resetKey?: string
  /** false면 측정 중지(교훈 화면 등) */
  active?: boolean
}

/** 따라 쓰기 중 타수·정확도 실시간 측정 */
export function useTypingStats({
  target,
  draft,
  typed,
  resetKey,
  active = true,
}: Options): TypingStatsSnapshot {
  const [acc, setAcc] = useState<TypingStatsAccumulator>(() => createTypingStatsAccumulator())
  const prevDraftRef = useRef('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const fresh = createTypingStatsAccumulator()
    setAcc(fresh)
    prevDraftRef.current = ''
    setNow(Date.now())
  }, [resetKey, target])

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [active])

  useEffect(() => {
    if (!active || !target.length) return
    const prev = prevDraftRef.current
    if (draft !== prev) {
      setAcc((current) => recordDraftDelta(current, prev, draft, target))
      prevDraftRef.current = draft
    }
  }, [draft, target, active])

  return useMemo(
    () => computeTypingStats(acc, typed.length, target.length, now),
    [acc, typed.length, target.length, now],
  )
}
