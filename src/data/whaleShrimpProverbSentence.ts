import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

export const WHALE_SHRIMP_TEXT = '고래 싸움에 새우 등 터진다'

export function createWhaleShrimpProverbSentence() {
  return createSixPanelProverbSentence(
    WHALE_SHRIMP_TEXT,
    [
      PROVERBS_IMAGES.whaleShrimp01,
      PROVERBS_IMAGES.whaleShrimp02,
      PROVERBS_IMAGES.whaleShrimp03,
      PROVERBS_IMAGES.whaleShrimp04,
      PROVERBS_IMAGES.whaleShrimp05,
      PROVERBS_IMAGES.whaleShrimp06,
    ],
    ['싸움에', '새우', '등', '터진', '다'],
    undefined,
    '다른 사람 싸움에 휘말리면, 상관없던 약한 사람이 먼저 다치기 쉬워요.',
  )
}
