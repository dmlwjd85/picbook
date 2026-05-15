import { createId } from '../lib/ids'
import { mergeTypedSegments } from '../lib/typedScriptSegments'
import type { Cue, LayerAnchorLabel, ReadingPack } from '../types/pack'

/**
 * 제작용(하이픈 오른쪽은 연출 메모 — 사용자에게 노출하지 않음).
 * 화면 전환 charIndex는 띄어쓰기 뒤 낱막이 시작할 때(첫 글자)에 맞춘다.
 */
const SCRIPT_PARTS = [
  '삼권분립은 - 장면설명은 삭제(사법 ~나타나요. 부분)',
  '한 국가기관이 나라의 중요한 일을 - 타이핑 되는동안 조금씩 맨 왼쪽의 사법부가 나머지 화면을 찌그러뜨리며 꽉 채움',
  '마음대로 처리할 수 없게 - 그림자 느낌의 법복을 입은 독재자가 나타나며 세 건물에 연결된 꼭두각시 줄을 잡는 장면으로 수정',
  '서로를 견제하고 - 밧줄이 있던 원래 이미지에 텍스트는 각각의 손목에만 사법부, 입법부, 행정부 표기, 화면이 왼쪽 오른쪽 위로 한번씩 치우치는 효과',
  '균형을 이뤄내기 위한 것이다. - 점점 빛을 중심으로 클로즈 업',
] as const

const TEXT = mergeTypedSegments(SCRIPT_PARTS)

const base = import.meta.env.BASE_URL

/** 기존 건물 클립 일러스트 (삼분할·사법 확장 구간) */
const SLIDE_URLS = [1, 2, 3, 4, 5, 6].map((n) => `${base}demo/samgwon-${n}.png`)

/** 법복·그림자 톤 독재·꼭두각시 장면 */
const DICTATOR_ROBE_URL = `${base}demo/samgwon-dictator-robe.png`

/** 견제 장면: 밧줄 일러스트(원본 samgwon-5) */
const CHECK_ROPE_URL = SLIDE_URLS[4]!

/** 균형·평화 톤, 이미지 내 플로팅 텍스트 없음 */
const BALANCE_NOTEXT_URL = `${base}demo/samgwon-balance-notext.png`

/** samgwon-5 위 손목 라벨(좌·상·우 손) */
const CHECK_ANCHORS: LayerAnchorLabel[] = [
  { text: '사법부', leftPct: 20, topPct: 56 },
  { text: '입법부', leftPct: 50, topPct: 26 },
  { text: '행정부', leftPct: 80, topPct: 56 },
]

/** 「지금 보이는 그림」 단계(1~5) — 낱막 시작 시점 */
export const SEPARATION_DEMO_VISUAL_MILESTONES = [0, 6, 25, 39, 48] as const

const W3 = 33.34

/** 사법 폭이 jw일 때 입법·행정이 나머지를 반씩 나눔 */
function splitRemain(jw: number): { lw: number; ex: number } {
  const rem = 100 - jw
  const half = rem / 2
  return { lw: half, ex: jw + half }
}

/**
 * 삼권분립 데모 팩.
 * - 0·2·4: 「삼권분립은」 타이핑 중 사법·입법·행정 삼분할(한 낱막 안).
 * - 6·8·14·18·22: 「한…일을」 각 낱막 시작마다 사법 확대, 24에서 사법만 꽉 채움.
 * - 25: 독재자 장면.
 * - 39·43·47: 견제 장면 + 좌·우·위로 한 번씩 치우침.
 * - 48·52·57·60: 균형 장면, 빛 중심으로 점점 클로즈업.
 */
export function createSeparationThreePowersDemoPack(): ReadingPack {
  const sentenceId = createId()
  const layerStory = createId()
  const layerJustice = createId()
  const layerLegis = createId()
  const layerExec = createId()
  const layerDictator = createId()

  const urlJustice = SLIDE_URLS[3]!
  const urlLegis = SLIDE_URLS[1]!
  const urlExec = SLIDE_URLS[2]!

  const squeezeSteps: { charIndex: number; jw: number }[] = [
    { charIndex: 6, jw: 41 },
    { charIndex: 8, jw: 52 },
    { charIndex: 14, jw: 62 },
    { charIndex: 18, jw: 71 },
    { charIndex: 22, jw: 88 },
  ]

  const squeezeCues: Cue[] = squeezeSteps.map(({ charIndex, jw }) => {
    const { lw, ex } = splitRemain(jw)
    return {
      id: createId(),
      charIndex,
      effects: [
        {
          kind: 'layerTransform' as const,
          layerId: layerJustice,
          x: 0,
          y: 0,
          width: jw,
          fillHeight: true,
        },
        {
          kind: 'layerTransform' as const,
          layerId: layerLegis,
          x: jw,
          y: 0,
          width: lw,
          fillHeight: true,
        },
        {
          kind: 'layerTransform' as const,
          layerId: layerExec,
          x: ex,
          y: 0,
          width: lw,
          fillHeight: true,
        },
      ],
    }
  })

  const cues: Cue[] = [
    {
      id: createId(),
      charIndex: 0,
      effects: [
        { kind: 'layerShow', layerId: layerJustice },
        { kind: 'layerImage', layerId: layerJustice, imageUrl: urlJustice },
      ],
    },
    {
      id: createId(),
      charIndex: 2,
      effects: [
        { kind: 'layerShow', layerId: layerLegis },
        { kind: 'layerImage', layerId: layerLegis, imageUrl: urlLegis },
      ],
    },
    {
      id: createId(),
      charIndex: 4,
      effects: [
        { kind: 'layerShow', layerId: layerExec },
        { kind: 'layerImage', layerId: layerExec, imageUrl: urlExec },
      ],
    },
    ...squeezeCues,
    {
      id: createId(),
      charIndex: 24,
      effects: [
        { kind: 'layerHide', layerId: layerLegis },
        { kind: 'layerHide', layerId: layerExec },
        {
          kind: 'layerTransform',
          layerId: layerJustice,
          x: 0,
          y: 0,
          width: 100,
          scale: 0.88,
          fillHeight: true,
        },
      ],
    },
    {
      id: createId(),
      charIndex: 25,
      effects: [
        { kind: 'layerHide', layerId: layerJustice },
        { kind: 'layerShow', layerId: layerDictator },
        { kind: 'layerImage', layerId: layerDictator, imageUrl: DICTATOR_ROBE_URL },
      ],
    },
    {
      id: createId(),
      charIndex: 39,
      effects: [
        { kind: 'layerHide', layerId: layerDictator },
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
          panX: -5,
          panY: 0,
        },
        { kind: 'layerAnchorLabels', layerId: layerStory, labels: CHECK_ANCHORS },
      ],
    },
    {
      id: createId(),
      charIndex: 43,
      effects: [
        {
          kind: 'layerTransform',
          layerId: layerStory,
          panX: 5,
          panY: 0,
        },
      ],
    },
    {
      id: createId(),
      charIndex: 47,
      effects: [
        {
          kind: 'layerTransform',
          layerId: layerStory,
          panX: 0,
          panY: -4,
        },
      ],
    },
    {
      id: createId(),
      charIndex: 48,
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
    {
      id: createId(),
      charIndex: 52,
      effects: [{ kind: 'layerTransform', layerId: layerStory, scale: 1.14 }],
    },
    {
      id: createId(),
      charIndex: 57,
      effects: [{ kind: 'layerTransform', layerId: layerStory, scale: 1.22 }],
    },
    {
      id: createId(),
      charIndex: 60,
      effects: [{ kind: 'layerTransform', layerId: layerStory, scale: 1.32 }],
    },
  ]

  return {
    formatVersion: 1,
    id: 'demo-separation-three-powers',
    title: '삼권분립 — 장면별 연출 데모',
    description:
      '세 권력 삼분할, 한쪽 독점, 꼭두각시 위험, 손목 견제, 균형 장면이 타이핑에 맞춰 이어집니다. (앱에 포함된 일러스트)',
    author: 'PicBook 데모',
    updatedAt: new Date().toISOString(),
    sentences: [
      {
        id: sentenceId,
        text: TEXT,
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
          },
        ],
        cues,
      },
    ],
  }
}
