import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

export const ROLLING_STONE_TEXT = '굴러온 돌이 박힌 돌 뺀다'

export function createRollingStoneProverbSentence() {
  return createSixPanelProverbSentence(
    ROLLING_STONE_TEXT,
    [
      PROVERBS_IMAGES.rollingStone01,
      PROVERBS_IMAGES.rollingStone02,
      PROVERBS_IMAGES.rollingStone03,
      PROVERBS_IMAGES.rollingStone04,
      PROVERBS_IMAGES.rollingStone05,
      PROVERBS_IMAGES.rollingStone06,
    ],
    ['돌이', '박힌', '돌', '뺀', '다'],
    undefined,
    '새로 온 사람이 먼저 있던 자리를 빼앗을 수 있어요.',
  )
}
