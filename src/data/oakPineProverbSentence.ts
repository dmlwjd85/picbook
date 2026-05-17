import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { GLOSS_GARANGIP, glossAt } from './proverbVocab'

export const OAK_PINE_TEXT = '가랑잎이 솔잎더러 바스락거린다고 한다.'

export function createOakPineProverbSentence() {
  return createSixPanelProverbSentence(
    OAK_PINE_TEXT,
    [
      PROVERBS_IMAGES.oakPine01,
      PROVERBS_IMAGES.oakPine02,
      PROVERBS_IMAGES.oakPine03,
      PROVERBS_IMAGES.oakPine04,
      PROVERBS_IMAGES.oakPine05,
      PROVERBS_IMAGES.oakPine06,
    ],
    ['가랑잎', '솔잎', '바스락', '거린다', '한다'],
    undefined,
    '남 탓 말고, 내 잘못부터 보렴.',
    [
      GLOSS_GARANGIP,
      glossAt(OAK_PINE_TEXT, '솔잎', { term: '솔잎', definition: '소나무 가지에 달린 가느다란 잎' }),
      glossAt(OAK_PINE_TEXT, '바스락', {
        term: '바스락거리다',
        definition: '마른 잎 등이 스치며 내는 소리가 나다',
      }),
    ],
  )
}
