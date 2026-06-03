import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  computeTypingStats,
  createTypingStatsAccumulator,
  recordDraftDelta,
  recordSentenceSubmit,
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

export type TypingStatsResult = TypingStatsSnapshot & {
  /** 문장 완료 후 엔터·스페이스 — 이때 정확도 확정 */
  submitSentence: (raw: string) => void
}

/** 따라 쓰기 중 타수 실시간, 정확도는 제출 시에만 표시 */
export function useTypingStats({
  target,
  draft,
  typed,
  resetKey,
  active = true,
}: Options): TypingStatsResult {
  const [acc, setAcc] = useState<TypingStatsAccumulator>(() => createTypingStatsAccumulator())
  const [submittedAccuracy, setSubmittedAccuracy] = useState<number | null>(null)
  const prevDraftRef = useRef('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const fresh = createTypingStatsAccumulator()
    setAcc(fresh)
    setSubmittedAccuracy(null)
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

  const submitSentence = useCallback(
    (raw: string) => {
      if (!target.length) return
      setAcc((current) => {
        const { acc: next, accuracy } = recordSentenceSubmit(
          current,
          prevDraftRef.current,
          raw,
          target,
        )
        prevDraftRef.current = raw
        setSubmittedAccuracy(accuracy)
        return next
      })
      setNow(Date.now())
    },
    [target],
  )

  const snapshot = useMemo(
    () => computeTypingStats(acc, typed.length, target.length, submittedAccuracy, now),
    [acc, typed.length, target.length, submittedAccuracy, now],
  )

  return useMemo(
    () => ({
      ...snapshot,
      submitSentence,
    }),
    [snapshot, submitSentence],
  )
}
