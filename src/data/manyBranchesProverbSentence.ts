import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

export const MANY_BRANCHES_TEXT = '가지 많은 나무에 바람 잘 날 없다.'

export function createManyBranchesProverbSentence() {
  return createSixPanelProverbSentence(
    MANY_BRANCHES_TEXT,
    [
      PROVERBS_IMAGES.branches01,
      PROVERBS_IMAGES.branches02,
      PROVERBS_IMAGES.branches03,
      PROVERBS_IMAGES.branches04,
      PROVERBS_IMAGES.branches05,
      PROVERBS_IMAGES.branches06,
    ],
    ['나무', '바람', '잘', '날', '없다'],
    undefined,
    '한꺼번에 많으면 힘들어요.',
  )
}
