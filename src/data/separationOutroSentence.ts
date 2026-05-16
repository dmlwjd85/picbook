import { createId } from '../lib/ids'
import { charRangeSteps } from '../lib/cueCharSteps'
import type { Cue, SentenceBlock } from '../types/pack'
import { BALANCE_NOTEXT_URL, SLIDE_URLS, idxAfter } from './separationPackShared'

const OUTRO_TEXT = '이는 국민의 자유와 권리를 보장하기 위한 것이다.'

export function createSeparationOutroSentence(): SentenceBlock {
  const layerGlow = createId()
  const layerBalance = createId()

  const urlWarm = SLIDE_URLS[4]!

  const zoomCues: Cue[] = charRangeSteps(
    idxAfter(OUTRO_TEXT, '보장'),
    OUTRO_TEXT.length - 1,
    1.02,
    1.22,
  ).map(({ charIndex, value }) => ({
    id: createId(),
    charIndex,
    effects: [
      {
        kind: 'layerTransform',
        layerId: layerBalance,
        scale: value,
        panY: -Math.round((value - 1) * 20),
      },
    ],
  }))

  const cues: Cue[] = [
    {
      id: createId(),
      charIndex: 0,
      effects: [
        { kind: 'layerShow', layerId: layerGlow },
        { kind: 'layerImage', layerId: layerGlow, imageUrl: urlWarm },
        { kind: 'layerOpacity', layerId: layerGlow, opacity: 0.85 },
      ],
    },
    {
      id: createId(),
      charIndex: idxAfter(OUTRO_TEXT, '국민'),
      effects: [
        { kind: 'layerShow', layerId: layerBalance },
        { kind: 'layerImage', layerId: layerBalance, imageUrl: BALANCE_NOTEXT_URL },
        {
          kind: 'layerTransform',
          layerId: layerBalance,
          x: 0,
          y: 0,
          width: 100,
          scale: 1,
          fillHeight: true,
        },
        { kind: 'layerOpacity', layerId: layerGlow, opacity: 0.4 },
      ],
    },
    {
      id: createId(),
      charIndex: idxAfter(OUTRO_TEXT, '자유'),
      effects: [{ kind: 'layerTransform', layerId: layerBalance, panX: -8, panY: 4 }],
    },
    {
      id: createId(),
      charIndex: idxAfter(OUTRO_TEXT, '권리'),
      effects: [{ kind: 'layerTransform', layerId: layerBalance, panX: 8, panY: 4 }],
    },
    {
      id: createId(),
      charIndex: idxAfter(OUTRO_TEXT, '보장'),
      effects: [
        { kind: 'layerTransform', layerId: layerBalance, panX: 0, panY: 0 },
        { kind: 'layerOpacity', layerId: layerGlow, opacity: 0.2 },
      ],
    },
    ...zoomCues,
  ]

  return {
    id: createId(),
    text: OUTRO_TEXT,
    captions: [
      { charIndex: 0, text: '권력 분립은 결국 국민을 위한 제도입니다' },
      { charIndex: idxAfter(OUTRO_TEXT, '보장'), text: '자유와 권리를 지키기 위한 균형' },
    ],
    layers: [
      {
        id: layerGlow,
        label: '따뜻한 배경',
        zIndex: 0,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 0,
        y: 0,
        width: 100,
        scale: 1,
        fillHeight: true,
      },
      {
        id: layerBalance,
        label: '균형·국민',
        zIndex: 2,
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
