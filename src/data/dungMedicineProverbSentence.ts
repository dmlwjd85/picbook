import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { glossAt } from './proverbVocab'

export const DUNG_MEDICINE_TEXT = '개똥도 약에 쓰려면 없다.'

export function createDungMedicineProverbSentence() {
  return createSixPanelProverbSentence(
    DUNG_MEDICINE_TEXT,
    [
      PROVERBS_IMAGES.dung01,
      PROVERBS_IMAGES.dung02,
      PROVERBS_IMAGES.dung03,
      PROVERBS_IMAGES.dung04,
      PROVERBS_IMAGES.dung05,
      PROVERBS_IMAGES.dung06,
    ],
    ['개똥도', '약에', '쓰려', '면', '없다'],
    undefined,
    '평소에 흔한 것도, 급할 땐 찾기 어려워요.',
    [glossAt(DUNG_MEDICINE_TEXT, '약', { term: '약', definition: '병을 고치는 데 쓰는 물건' })],
  )
}
