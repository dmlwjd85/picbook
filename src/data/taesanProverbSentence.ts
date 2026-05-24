import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { glossAt } from './proverbVocab'

export const TAESAN_TEXT = '일이 갈 수록 태산이다'

export function createTaesanProverbSentence() {
  return createSixPanelProverbSentence(
    TAESAN_TEXT,
    [
      PROVERBS_IMAGES.taesan01,
      PROVERBS_IMAGES.taesan02,
      PROVERBS_IMAGES.taesan03,
      PROVERBS_IMAGES.taesan04,
      PROVERBS_IMAGES.taesan05,
      PROVERBS_IMAGES.taesan06,
    ],
    ['일이', '갈', '수록', '태산', '이다'],
    undefined,
    '일이 쌓일수록 점점 더 힘들어져요.',
    [glossAt(TAESAN_TEXT, '태산', { term: '태산', definition: '아주 높고 험한 산' })],
  )
}
