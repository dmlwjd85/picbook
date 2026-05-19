import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { glossAt } from './proverbVocab'

export const BEADS_PEARL_TEXT = '구슬이 서 말이라도 꿰어야 보배.'

export function createBeadsPearlProverbSentence() {
  return createSixPanelProverbSentence(
    BEADS_PEARL_TEXT,
    [
      PROVERBS_IMAGES.beadsPearl01,
      PROVERBS_IMAGES.beadsPearl02,
      PROVERBS_IMAGES.beadsPearl03,
      PROVERBS_IMAGES.beadsPearl04,
      PROVERBS_IMAGES.beadsPearl05,
      PROVERBS_IMAGES.beadsPearl06,
    ],
    ['서', '말', '이라도', '꿰어', '보배'],
    undefined,
    '좋은 재능도 가다듬지 않으면 쓸모가 없어요.',
    [
      glossAt(BEADS_PEARL_TEXT, '서', { term: '서', definition: '충분히 많은 양' }),
      glossAt(BEADS_PEARL_TEXT, '보배', { term: '보배', definition: '아주 귀한 보석' }),
    ],
  )
}
