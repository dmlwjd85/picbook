import { playbackTypedPrefix } from './typingMatch'

export type TypingStatsAccumulator = {
  startedAt: number | null
  keystrokes: number
  errors: number
  peakCorrect: number
}

export type TypingStatsSnapshot = {
  /** 분당 타수(맞게 입력한 글자 기준) */
  cpm: number
  /** 0–100 — 제출 후에만 의미 있음 */
  accuracy: number
  /** 엔터·스페이스로 문장 제출 후 true */
  accuracySubmitted: boolean
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

/** 연출·typed와 동일 — 조합 중 초성 일치는 오타로 보지 않음 */
function effectiveCorrectLen(draft: string, target: string): number {
  return playbackTypedPrefix(draft, target).length
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

  const prevCorrect = effectiveCorrectLen(prevDraft, target)
  const nextCorrect = effectiveCorrectLen(nextDraft, target)

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

/** 제출 시점 누적값으로 정확도 산출 */
export function finalizeAccuracy(acc: TypingStatsAccumulator): number {
  if (acc.keystrokes === 0) return 100
  return Math.min(100, Math.round(((acc.keystrokes - acc.errors) / acc.keystrokes) * 100))
}

/** 제출 직전 raw 한 번 더 반영(조합 종료 직후 draft와 동기화) */
export function recordSentenceSubmit(
  acc: TypingStatsAccumulator,
  prevDraft: string,
  submitRaw: string,
  target: string,
  now = Date.now(),
): { acc: TypingStatsAccumulator; accuracy: number } {
  const next = recordDraftDelta(acc, prevDraft, submitRaw, target, now)
  return { acc: next, accuracy: finalizeAccuracy(next) }
}

export function computeTypingStats(
  acc: TypingStatsAccumulator,
  typedChars: number,
  targetChars: number,
  submittedAccuracy: number | null,
  now = Date.now(),
): TypingStatsSnapshot {
  const elapsedMs = acc.startedAt != null ? Math.max(0, now - acc.startedAt) : 0
  const minutes = elapsedMs / 60000
  const cpm = minutes > 0 ? Math.round(typedChars / minutes) : 0

  return {
    cpm,
    accuracy: submittedAccuracy ?? 100,
    accuracySubmitted: submittedAccuracy != null,
    elapsedSec: Math.round(elapsedMs / 1000),
    keystrokes: acc.keystrokes,
    errors: acc.errors,
    typedChars,
    targetChars,
  }
}

export function formatTypingStatsLine(stats: TypingStatsSnapshot): string {
  if (stats.keystrokes === 0) return ''
  if (!stats.accuracySubmitted) return `${stats.cpm}타/분`
  return `${stats.cpm}타/분 · 정확도 ${stats.accuracy}%`
}
