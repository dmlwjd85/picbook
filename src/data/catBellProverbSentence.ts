import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

export const CAT_BELL_TEXT = '고양이 목에 방울을 달기.'

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
    ['목에', '방울', '을', '달', '기'],
    undefined,
    '좋은 생각도 직접 하기 어려우면 실행이 안 돼요.',
  )
}
