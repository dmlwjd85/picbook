import type { SentenceBlock, VocabGloss } from '../types/pack'
import { longestMatchingPrefix } from './typingMatch'

/** 타이핑·조합 중 글자 수(연출 큐와 동일하게 draft 반영) */
export function vocabTypedLength(target: string, typed: string, draft: string): number {
  const raw = draft.length > typed.length ? draft : typed
  return longestMatchingPrefix(raw, target).length
}

/** 해당 낱말 구간을 치는 동안 연출 상단에 풀이 표시 */
export function getActiveVocabGlosses(
  sentence: SentenceBlock,
  typedLength: number,
): VocabGloss[] {
  const list = sentence.vocabGlosses ?? []
  if (list.length === 0) return []

  return list.filter((g) => {
    const end = g.charIndex + g.term.length
    return typedLength >= g.charIndex && typedLength <= end + 1
  })
}
