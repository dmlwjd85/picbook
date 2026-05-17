import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

export const LIVER_GALL_TEXT = '간에 붙었다 쓸개에 붙었다 한다.'

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
    '한곳만 정해서 해요.',
  )
}
