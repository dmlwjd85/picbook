import { createId } from './ids'
import type { Cue, SentenceBlock, VocabGloss } from '../types/pack'
import { idxAfter } from '../data/proverbsPackShared'

/** 6컷 속담 문장 공통 생성 */
export function createSixPanelProverbSentence(
  text: string,
  images: readonly [string, string, string, string, string, string],
  cueNeedles: readonly [string, string, string, string, string],
  cueNeedlesFrom?: readonly [number, number, number, number, number],
  closingLine?: string,
  vocabGlosses?: VocabGloss[],
): SentenceBlock {
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

  const cues = [
    { id: createId(), charIndex: 0, effects: show(images[0]) },
    ...cueNeedles.map((needle, i) => ({
      id: createId(),
      charIndex: idxAfter(text, needle, cueNeedlesFrom?.[i] ?? 0),
      effects: show(images[i + 1]),
    })),
  ]

  return {
    id: createId(),
    text,
    layers: [
      {
        id: layer,
        label: '속담 장면',
        zIndex: 1,
        imageUrl: images[0],
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
    ...(closingLine ? { closingLine } : {}),
    ...(vocabGlosses?.length ? { vocabGlosses } : {}),
  }
}
