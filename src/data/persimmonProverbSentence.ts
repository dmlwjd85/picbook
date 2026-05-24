import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { glossAt } from './proverbVocab'

export const PERSIMMON_TEXT = '감나무 밑에서 감 떨어지기를 바란다'

export function createPersimmonProverbSentence() {
  return createSixPanelProverbSentence(
    PERSIMMON_TEXT,
    [
      PROVERBS_IMAGES.persimmon01,
      PROVERBS_IMAGES.persimmon02,
      PROVERBS_IMAGES.persimmon03,
      PROVERBS_IMAGES.persimmon04,
      PROVERBS_IMAGES.persimmon05,
      PROVERBS_IMAGES.persimmon06,
    ],
    ['밑에서', '감', '떨어지', '기를', '바란다'],
    undefined,
    '아무것도 안 하면서 좋은 일만 기대할 순 없어요.',
    [
      glossAt(PERSIMMON_TEXT, '감나무', { term: '감나무', definition: '감 열매가 열리는 나무' }),
      glossAt(PERSIMMON_TEXT, '떨어지', {
        term: '떨어지다',
        definition: '위에서 아래로 떨어지다',
      }),
    ],
  )
}
