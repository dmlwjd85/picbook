import { longestMatchingPrefix } from './typingMatch'

export type TypingStatsAccumulator = {
  startedAt: number | null
  keystrokes: number
  errors: number
  peakCorrect: number
}

export type TypingStatsSnapshot = {
  /** 분당 타수(맞게 입력한 글자 기준) */
  cpm: number
  /** 0–100 */
  accuracy: number
  elapsedSec: number
  keystrokes: number
  errors: number
  typedChars: number
  targetChars: number
}

export function createTypingStatsAccumulator(): TypingStatsAccumulator {
  return {
    startedAt: null,
    keystrokes: 0,
    errors: 0,
    peakCorrect: 0,
  }
}

/** draft 변경 1회분 — 추가·삭제·교체에 따른 타수·오타 누적 */
export function recordDraftDelta(
  acc: TypingStatsAccumulator,
  prevDraft: string,
  nextDraft: string,
  target: string,
  now = Date.now(),
): TypingStatsAccumulator {
  if (prevDraft === nextDraft) return acc

  const next = { ...acc }
  if (next.startedAt == null) next.startedAt = now

  const prevCorrect = longestMatchingPrefix(prevDraft, target).length
  const nextCorrect = longestMatchingPrefix(nextDraft, target).length

  if (nextDraft.length > prevDraft.length) {
    const added = nextDraft.length - prevDraft.length
    next.keystrokes += added
    const gained = Math.max(0, nextCorrect - prevCorrect)
    next.errors += added - gained
  } else if (nextDraft.length < prevDraft.length) {
    next.keystrokes += prevDraft.length - nextDraft.length
  } else {
    next.keystrokes += 1
    if (nextCorrect <= prevCorrect) next.errors += 1
  }

  next.peakCorrect = Math.max(next.peakCorrect, nextCorrect)
  return next
}

export function computeTypingStats(
  acc: TypingStatsAccumulator,
  typedChars: number,
  targetChars: number,
  now = Date.now(),
): TypingStatsSnapshot {
  const elapsedMs = acc.startedAt != null ? Math.max(0, now - acc.startedAt) : 0
  const minutes = elapsedMs / 60000
  const cpm = minutes > 0 ? Math.round(typedChars / minutes) : 0
  const accuracy =
    acc.keystrokes > 0
      ? Math.min(100, Math.round(((acc.keystrokes - acc.errors) / acc.keystrokes) * 100))
      : 100

  return {
    cpm,
    accuracy,
    elapsedSec: Math.round(elapsedMs / 1000),
    keystrokes: acc.keystrokes,
    errors: acc.errors,
    typedChars,
    targetChars,
  }
}

export function formatTypingStatsLine(stats: TypingStatsSnapshot): string {
  if (stats.keystrokes === 0) return ''
  return `${stats.cpm}타/분 · 정확도 ${stats.accuracy}%`
}
