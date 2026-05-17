import { createId } from '../lib/ids'
import type { Cue, SentenceBlock } from '../types/pack'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { GLOSS_GARANGBI } from './proverbVocab'
import { idxAfter } from './proverbsPackShared'

/** 가랑비에 옷 젖는 줄 모른다 — 6컷 연출 */
export const DRIZZLE_RAIN_TEXT = '가랑비에 옷 젖는 줄 모른다.'

export function createDrizzleRainProverbSentence(): SentenceBlock {
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
    { id: createId(), charIndex: 0, effects: show(PROVERBS_IMAGES.drizzle01) },
    {
      id: createId(),
      charIndex: idxAfter(DRIZZLE_RAIN_TEXT, '비에'),
      effects: show(PROVERBS_IMAGES.drizzle02),
    },
    {
      id: createId(),
      charIndex: idxAfter(DRIZZLE_RAIN_TEXT, '옷'),
      effects: show(PROVERBS_IMAGES.drizzle03),
    },
    {
      id: createId(),
      charIndex: idxAfter(DRIZZLE_RAIN_TEXT, '젖는'),
      effects: show(PROVERBS_IMAGES.drizzle04),
    },
    {
      id: createId(),
      charIndex: idxAfter(DRIZZLE_RAIN_TEXT, '줄'),
      effects: show(PROVERBS_IMAGES.drizzle05),
    },
    {
      id: createId(),
      charIndex: idxAfter(DRIZZLE_RAIN_TEXT, '모른다'),
      effects: show(PROVERBS_IMAGES.drizzle06),
    },
  ]

  return {
    id: createId(),
    text: DRIZZLE_RAIN_TEXT,
    layers: [
      {
        id: layer,
        label: '속담 장면',
        zIndex: 1,
        imageUrl: PROVERBS_IMAGES.drizzle01,
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
    closingLine: '조금씩 쌓이면 어느새 크게 다가와요.',
    vocabGlosses: [GLOSS_GARANGBI],
  }
}
