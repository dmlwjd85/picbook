import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  computeTypingStats,
  createTypingStatsAccumulator,
  recordDraftDelta,
  recordSentenceSubmit,
  type TypingStatsAccumulator,
  type TypingStatsSnapshot,
  finalizeAccuracy,
  recordDraftDelta as applyDraftDelta,
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
  /** 지금 이 순간 제출한다면 나올 타수·정확도 (상태는 바꾸지 않는다) */
  peekResult: (raw: string) => { cpm: number; accuracy: number }
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

  // 제출 순간의 값을 바로 돌려주려면 최신 누적값과 글자 수를 ref로도 들고 있어야 한다
  const accRef = useRef(acc)
  accRef.current = acc
  const typedLenRef = useRef(typed.length)
  typedLenRef.current = typed.length

  const peekResult = useCallback(
    (raw: string) => {
      if (!target.length) return { cpm: 0, accuracy: 100 }
      const at = Date.now()
      const finalAcc = applyDraftDelta(accRef.current, prevDraftRef.current, raw, target, at)
      const accuracy = finalizeAccuracy(finalAcc)
      const chars = Math.max(typedLenRef.current, target.length)
      return { cpm: computeTypingStats(finalAcc, chars, target.length, accuracy, at).cpm, accuracy }
    },
    [target],
  )

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
      peekResult,
    }),
    [snapshot, submitSentence, peekResult],
  )
}
