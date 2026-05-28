import { createId } from '../lib/ids'
import type { Cue, SentenceBlock } from '../types/pack'
import { POWERS_OUTRO_IMAGES } from './separationPowersAssets'
import { idxAfter } from './separationPackShared'

const OUTRO_TEXT = '이는 국민의 자유와 권리를 보장하기 위한 것이다'

export function createSeparationOutroSentence(): SentenceBlock {
  const layerScene = createId()

  const showScene = (imageUrl: string, opacity = 1): Cue['effects'] => [
    { kind: 'layerShow', layerId: layerScene },
    { kind: 'layerImage', layerId: layerScene, imageUrl },
    {
      kind: 'layerTransform',
      layerId: layerScene,
      x: 0,
      y: 0,
      width: 100,
      scale: 1,
      fillHeight: true,
      panX: 0,
      panY: 0,
    },
    { kind: 'layerOpacity', layerId: layerScene, opacity },
  ]

  const cues: Cue[] = [
    {
      id: createId(),
      charIndex: 0,
      effects: showScene(POWERS_OUTRO_IMAGES.citizensStatic, 0.92),
    },
    {
      id: createId(),
      charIndex: idxAfter(OUTRO_TEXT, '국민'),
      effects: showScene(POWERS_OUTRO_IMAGES.citizensStatic),
    },
    {
      id: createId(),
      charIndex: idxAfter(OUTRO_TEXT, '자'),
      effects: showScene(POWERS_OUTRO_IMAGES.citizensActive),
    },
    {
      id: createId(),
      charIndex: idxAfter(OUTRO_TEXT, '보장'),
      effects: showScene(POWERS_OUTRO_IMAGES.citizensBarrier),
    },
  ]

  return {
    id: createId(),
    text: OUTRO_TEXT,
    captions: [
      { charIndex: idxAfter(OUTRO_TEXT, '국민'), text: '국민이 주인인 나라' },
      { charIndex: idxAfter(OUTRO_TEXT, '자유'), text: '자유롭게 살아갈 권리' },
      { charIndex: idxAfter(OUTRO_TEXT, '보장'), text: '그 권리를 지켜 주는 제도' },
    ],
    layers: [
      {
        id: layerScene,
        label: '국민 장면',
        zIndex: 1,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 0,
        y: 0,
        width: 100,
        scale: 1,
        fillHeight: true,
      },
    ],
    cues,
  }
}
