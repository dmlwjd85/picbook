import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

export const STEADY_TOWER_TEXT = '공든 탑이 무너지랴'

export function createSteadyTowerProverbSentence() {
  return createSixPanelProverbSentence(
    STEADY_TOWER_TEXT,
    [
      PROVERBS_IMAGES.steadyTower01,
      PROVERBS_IMAGES.steadyTower02,
      PROVERBS_IMAGES.steadyTower03,
      PROVERBS_IMAGES.steadyTower04,
      PROVERBS_IMAGES.steadyTower05,
      PROVERBS_IMAGES.steadyTower06,
    ],
    ['공든', '탑이', '무너', '지랴', '랴'],
    undefined,
    '정성껏 쌓은 탑은 쉽게 무너지지 않아요.',
  )
}
