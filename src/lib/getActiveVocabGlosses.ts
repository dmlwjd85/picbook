import type { SentenceBlock, VocabGloss } from '../types/pack'

/** 해당 낱말을 치는 구간에서만 장면 위에 풀이 표시 */
export function getActiveVocabGlosses(
  sentence: SentenceBlock,
  typedLength: number,
): VocabGloss[] {
  const list = sentence.vocabGlosses ?? []
  if (list.length === 0) return []

  return list.filter((g) => {
    const end = g.charIndex + g.term.length
    return typedLength >= g.charIndex && typedLength <= end
  })
}
