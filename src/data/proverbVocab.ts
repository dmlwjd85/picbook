import type { VocabGloss } from '../types/pack'
import { idxAfter } from './proverbsPackShared'

/** 네이버 어학사전 뜻을 참고한 초등용 낱말 풀이 */

export const GLOSS_GARANGBI: VocabGloss = {
  charIndex: 0,
  term: '가랑비',
  definition: '가늘게 내리는 비',
}

export const GLOSS_GARANGIP: VocabGloss = {
  charIndex: 0,
  term: '가랑잎',
  definition: '나무에서 떨어진 마른 잎',
}

export function glossAt(
  text: string,
  needle: string,
  gloss: Omit<VocabGloss, 'charIndex'>,
  from = 0,
): VocabGloss {
  return { charIndex: idxAfter(text, needle, from), ...gloss }
}
