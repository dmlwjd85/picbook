import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

export const CAT_BELL_TEXT = '고양이 목에 방울 달기'

export function createCatBellProverbSentence() {
  return createSixPanelProverbSentence(
    CAT_BELL_TEXT,
    [
      PROVERBS_IMAGES.catBell01,
      PROVERBS_IMAGES.catBell02,
      PROVERBS_IMAGES.catBell03,
      PROVERBS_IMAGES.catBell04,
      PROVERBS_IMAGES.catBell05,
      PROVERBS_IMAGES.catBell06,
    ],
    ['고양이', '목에', '방울', '달기', '기'],
    undefined,
    '아무리 좋은 생각도 실천하지 못하면 쓸모 없어요',
  )
}
