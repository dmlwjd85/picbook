import { createId } from '../lib/ids'
import { charRangeSteps } from '../lib/cueCharSteps'
import { mergeTypedSegments } from '../lib/typedScriptSegments'
import type { Cue, LayerAnchorLabel, SentenceBlock } from '../types/pack'
import {
  BALANCE_NOTEXT_URL,
  C,
  CHECK_ROPE_URL,
  DICTATOR_ROBE_URL,
  SLIDE_URLS,
  W,
  W3,
  idxAfter,
  splitRemain,
} from './separationPackShared'

const SCRIPT_PARTS = [
  '삼권분립은 - 장면설명은 삭제(사법 ~나타나요. 부분)',
  '한 국가기관이 나라의 중요한 일을 - 타이핑 되는동안 조금씩 맨 왼쪽의 사법부가 나머지 화면을 찌그러뜨리며 꽉 채움',
  '마음대로 처리할 수 없게 - 얼굴 부분으로 점점 클로즈업하다가 빨간 X 표시 후 다음 장면',
  '서로를 견제하고 - 중앙 시작, 이후 왼쪽·오른쪽·위로 더 크게 흔들렸다가 다음으로',
  '균형을 이뤄내기 위한 것이다. - 점점 빛을 중심으로 클로즈 업',
] as const

export const MAIN_SEPARATION_TEXT = mergeTypedSegments(SCRIPT_PARTS)

const CHECK_ANCHORS: LayerAnchorLabel[] = [
  { text: '사법부', leftPct: 20, topPct: 56 },
  { text: '입법부', leftPct: 50, topPct: 26 },
  { text: '행정부', leftPct: 80, topPct: 56 },
]

function squeezeCue(
  charIndex: number,
  jw: number,
  layerJustice: string,
  layerLegis: string,
  layerExec: string,
): Cue {
  const { lw, ex } = splitRemain(jw)
  return {
    id: createId(),
    charIndex,
    effects: [
      {
        kind: 'layerTransform',
        layerId: layerJustice,
        x: 0,
        y: 0,
        width: jw,
        fillHeight: true,
      },
      {
        kind: 'layerTransform',
        layerId: layerLegis,
        x: jw,
        y: 0,
        width: lw,
        fillHeight: true,
      },
      {
        kind: 'layerTransform',
        layerId: layerExec,
        x: ex,
        y: 0,
        width: lw,
        fillHeight: true,
      },
    ],
  }
}

export function createSeparationMainSentence(): SentenceBlock {
  const layerStory = createId()
  const layerJustice = createId()
  const layerLegis = createId()
  const layerExec = createId()
  const layerDictator = createId()

  const urlJustice = SLIDE_URLS[3]!
  const urlLegis = SLIDE_URLS[1]!
  const urlExec = SLIDE_URLS[2]!

  const squeezeCues: Cue[] = charRangeSteps(7, 23, 41, 88).map(({ charIndex, value }) =>
    squeezeCue(charIndex, value, layerJustice, layerLegis, layerExec),
  )

  const dictatorZoomCues: Cue[] = charRangeSteps(27, 34, 1.04, 1.28).map(({ charIndex, value }) => ({
    id: createId(),
    charIndex,
    effects: [
      {
        kind: 'layerTransform',
        layerId: layerDictator,
        scale: value,
        panY: -Math.round((value - 1) * 28),
      },
    ],
  }))

  const cues: Cue[] = [
    {
      id: createId(),
      charIndex: idxAfter(MAIN_SEPARATION_TEXT, '한'),
      effects: [
        { kind: 'layerShow', layerId: layerJustice },
        { kind: 'layerImage', layerId: layerJustice, imageUrl: urlJustice },
        { kind: 'layerShow', layerId: layerLegis },
        { kind: 'layerImage', layerId: layerLegis, imageUrl: urlLegis },
        { kind: 'layerShow', layerId: layerExec },
        { kind: 'layerImage', layerId: layerExec, imageUrl: urlExec },
      ],
    },
    ...squeezeCues,
    {
      id: createId(),
      charIndex: W(25),
      effects: [
        { kind: 'layerHide', layerId: layerLegis },
        { kind: 'layerHide', layerId: layerExec },
        { kind: 'layerHide', layerId: layerJustice },
        { kind: 'layerShow', layerId: layerDictator },
        { kind: 'layerImage', layerId: layerDictator, imageUrl: DICTATOR_ROBE_URL },
        {
          kind: 'layerTransform',
          layerId: layerDictator,
          scale: 1,
          panX: 0,
          panY: 0,
          fillHeight: true,
        },
        { kind: 'layerStampOverlay', layerId: layerDictator, stamp: null },
      ],
    },
    ...dictatorZoomCues,
    {
      id: createId(),
      charIndex: 35,
      effects: [{ kind: 'layerStampOverlay', layerId: layerDictator, stamp: 'red-x' }],
    },
    {
      id: createId(),
      charIndex: W(39),
      effects: [
        { kind: 'layerHide', layerId: layerDictator },
        { kind: 'layerStampOverlay', layerId: layerDictator, stamp: null },
        { kind: 'layerShow', layerId: layerStory },
        { kind: 'layerImage', layerId: layerStory, imageUrl: CHECK_ROPE_URL },
        {
          kind: 'layerTransform',
          layerId: layerStory,
          x: 0,
          y: 0,
          width: 100,
          scale: 1,
          fillHeight: true,
          panX: 0,
          panY: 0,
        },
        { kind: 'layerAnchorLabels', layerId: layerStory, labels: CHECK_ANCHORS },
      ],
    },
    { id: createId(), charIndex: C(41), effects: [{ kind: 'layerTransform', layerId: layerStory, panX: -16, panY: 2 }] },
    { id: createId(), charIndex: C(43), effects: [{ kind: 'layerTransform', layerId: layerStory, panX: 16, panY: 2 }] },
    { id: createId(), charIndex: C(45), effects: [{ kind: 'layerTransform', layerId: layerStory, panX: 0, panY: -14 }] },
    {
      id: createId(),
      charIndex: W(48),
      effects: [
        { kind: 'layerImage', layerId: layerStory, imageUrl: BALANCE_NOTEXT_URL },
        { kind: 'layerAnchorLabels', layerId: layerStory, labels: null },
        {
          kind: 'layerTransform',
          layerId: layerStory,
          x: 0,
          y: 0,
          width: 100,
          scale: 1.06,
          fillHeight: true,
          panX: 0,
          panY: 0,
        },
      ],
    },
    ...charRangeSteps(49, MAIN_SEPARATION_TEXT.length - 1, 1.1, 1.32).map(({ charIndex, value }) => ({
      id: createId(),
      charIndex,
      effects: [{ kind: 'layerTransform' as const, layerId: layerStory, scale: value }],
    })),
  ]

  return {
    id: createId(),
    text: MAIN_SEPARATION_TEXT,
    layers: [
      {
        id: layerStory,
        label: '견제·균형 장면',
        zIndex: 1,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 0,
        y: 0,
        width: 100,
        scale: 1,
        panX: 0,
        panY: 0,
        fillHeight: true,
        anchorLabels: null,
        stampOverlay: null,
      },
      {
        id: layerJustice,
        label: '사법부',
        zIndex: 2,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 0,
        y: 0,
        width: W3,
        scale: 1,
        panX: 0,
        panY: 0,
        fillHeight: true,
        plateCaption: '사법부',
      },
      {
        id: layerLegis,
        label: '입법부',
        zIndex: 2,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: W3,
        y: 0,
        width: 33.33,
        scale: 1,
        panX: 0,
        panY: 0,
        fillHeight: true,
        plateCaption: '입법부',
      },
      {
        id: layerExec,
        label: '행정부',
        zIndex: 2,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 66.67,
        y: 0,
        width: 33.33,
        scale: 1,
        panX: 0,
        panY: 0,
        fillHeight: true,
        plateCaption: '행정부',
      },
      {
        id: layerDictator,
        label: '독재·꼭두각시',
        zIndex: 10,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 0,
        y: 0,
        width: 100,
        scale: 1,
        panX: 0,
        panY: 0,
        fillHeight: true,
        stampOverlay: null,
      },
    ],
    cues,
  }
}
