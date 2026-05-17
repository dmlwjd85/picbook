import { createId } from '../lib/ids'
import type { Cue, SentenceBlock } from '../types/pack'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { idxAfter } from './proverbsPackShared'

/** 가는 말이 고와야 오는 말이 곱다 — 6컷 연출 (연출 이미지 위 텍스트 없음) */
export const KIND_WORDS_TEXT = '가는 말이 고와야 오는 말이 곱다.'

export function createKindWordsProverbSentence(): SentenceBlock {
  const layer = createId()

  const show = (imageUrl: string): Cue['effects'] => [
    { kind: 'layerShow', layerId: layer },
    { kind: 'layerImage', layerId: layer, imageUrl },
    {
      kind: 'layerTransform',
      layerId: layer,
      x: 0,
      y: 0,
      width: 100,
      scale: 1,
      fillHeight: true,
      panX: 0,
      panY: 0,
    },
    { kind: 'layerOpacity', layerId: layer, opacity: 1 },
  ]

  const cues: Cue[] = [
    { id: createId(), charIndex: 0, effects: show(PROVERBS_IMAGES.kindWords01) },
    {
      id: createId(),
      charIndex: idxAfter(KIND_WORDS_TEXT, '말이'),
      effects: show(PROVERBS_IMAGES.kindWords02),
    },
    {
      id: createId(),
      charIndex: idxAfter(KIND_WORDS_TEXT, '고와야'),
      effects: show(PROVERBS_IMAGES.kindWords03),
    },
    {
      id: createId(),
      charIndex: idxAfter(KIND_WORDS_TEXT, '오는'),
      effects: show(PROVERBS_IMAGES.kindWords04),
    },
    {
      id: createId(),
      charIndex: idxAfter(KIND_WORDS_TEXT, '말이', 9),
      effects: show(PROVERBS_IMAGES.kindWords05),
    },
    {
      id: createId(),
      charIndex: idxAfter(KIND_WORDS_TEXT, '곱다'),
      effects: show(PROVERBS_IMAGES.kindWords06),
    },
  ]

  return {
    id: createId(),
    text: KIND_WORDS_TEXT,
    layers: [
      {
        id: layer,
        label: '속담 장면',
        zIndex: 1,
        imageUrl: PROVERBS_IMAGES.kindWords01,
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: 100,
        scale: 1,
        fillHeight: true,
      },
    ],
    cues,
    closingLine: '먼저 말을 곱게 하면, 돌아오는 말도 곱다.',
  }
}
