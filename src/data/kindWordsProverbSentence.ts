import { createId } from '../lib/ids'
import type { SentenceBlock } from '../types/pack'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

/** 장면마다 짧은 한글만 — 이미지가 주연 */
const SCENES: { text: string; image: string }[] = [
  { text: '나쁨', image: PROVERBS_IMAGES.kindWords01 },
  { text: '고움', image: PROVERBS_IMAGES.kindWords02 },
  { text: '거울', image: PROVERBS_IMAGES.kindWords03 },
  { text: '기다', image: PROVERBS_IMAGES.kindWords04 },
  { text: '돌아', image: PROVERBS_IMAGES.kindWords05 },
  { text: '곱다', image: PROVERBS_IMAGES.kindWords06 },
]

function sceneSentence(text: string, imageUrl: string): SentenceBlock {
  const layerId = createId()
  return {
    id: createId(),
    text,
    layers: [
      {
        id: layerId,
        label: text,
        zIndex: 1,
        imageUrl,
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: 100,
        scale: 1,
        fillHeight: true,
      },
    ],
    cues: [],
  }
}

export function createKindWordsProverbScenes(): SentenceBlock[] {
  return SCENES.map((s) => sceneSentence(s.text, s.image))
}
