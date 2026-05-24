import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { glossAt } from './proverbVocab'

export const LIVER_GALL_TEXT = '간에 붙었다 쓸개에 붙었다 한다'

export function createLiverGallProverbSentence() {
  return createSixPanelProverbSentence(
    LIVER_GALL_TEXT,
    [
      PROVERBS_IMAGES.liver01,
      PROVERBS_IMAGES.liver02,
      PROVERBS_IMAGES.liver03,
      PROVERBS_IMAGES.liver04,
      PROVERBS_IMAGES.liver05,
      PROVERBS_IMAGES.liver06,
    ],
    ['간에', '붙었다', '쓸개', '붙었다', '한다'],
    [0, 0, 0, 6, 0],
    '이익만 보고 이쪽저쪽 붙으면 믿음을 잃어.',
    [
      { charIndex: 0, term: '간', definition: '몸속에서 해독·영양 저장을 하는 기관' },
      glossAt(LIVER_GALL_TEXT, '쓸개', {
        term: '쓸개',
        definition: '간에서 만든 쓸즙을 모아 두는 기관(담낭)',
      }),
    ],
  )
}
