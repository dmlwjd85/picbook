import type { SentenceBlock } from '../types/pack'

/** 마지막 컷(마지막 큐)에 도달했을 때 등장인물 교훈 대사 */
export function getClosingCaption(sentence: SentenceBlock, typedLength: number): string | null {
  const line = sentence.closingLine?.trim()
  if (!line) return null
  const lastCueIndex = sentence.cues.reduce((max, c) => Math.max(max, c.charIndex), 0)
  if (typedLength < lastCueIndex) return null
  return line
}
