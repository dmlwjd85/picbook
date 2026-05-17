import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { glossAt } from './proverbVocab'

export const FROG_TADPOLE_TEXT = '개구리 올챙이 적 생각 못 한다.'

export function createFrogTadpoleProverbSentence() {
  return createSixPanelProverbSentence(
    FROG_TADPOLE_TEXT,
    [
      PROVERBS_IMAGES.frog01,
      PROVERBS_IMAGES.frog02,
      PROVERBS_IMAGES.frog03,
      PROVERBS_IMAGES.frog04,
      PROVERBS_IMAGES.frog05,
      PROVERBS_IMAGES.frog06,
    ],
    ['개구리', '올챙이', '적', '생각', '한다'],
    undefined,
    '잘나가면 예전을 잊고 거만해지기 쉬워요.',
    [
      glossAt(FROG_TADPOLE_TEXT, '올챙이', {
        term: '올챙이',
        definition: '개구리 새끼, 꼬리가 있는 물속 생물',
      }),
      glossAt(FROG_TADPOLE_TEXT, '적', { term: '적', definition: '어렸을 때, 예전' }),
    ],
  )
}
