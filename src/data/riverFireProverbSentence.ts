import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

export const RIVER_FIRE_TEXT = '강 건너 불 구경하듯 한다'

export function createRiverFireProverbSentence() {
  return createSixPanelProverbSentence(
    RIVER_FIRE_TEXT,
    [
      PROVERBS_IMAGES.riverFire01,
      PROVERBS_IMAGES.riverFire02,
      PROVERBS_IMAGES.riverFire03,
      PROVERBS_IMAGES.riverFire04,
      PROVERBS_IMAGES.riverFire05,
      PROVERBS_IMAGES.riverFire06,
    ],
    ['건너', '불', '구경', '하듯', '한다'],
    undefined,
    '내 일이 아니라고 구경만 하면 언젠가 그 일은 내게도 일어날 수 있어요.',
  )
}
