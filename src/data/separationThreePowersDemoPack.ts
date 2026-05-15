import { createId } from '../lib/ids'
import { mergeTypedSegments } from '../lib/typedScriptSegments'
import type { Cue, ReadingPack } from '../types/pack'

/**
 * 제작용(하이픈 오른쪽은 연출 메모 — 사용자에게 노출하지 않음).
 * mergeTypedSegments 로 타이핑 문장만 추출한다.
 */
const SCRIPT_PARTS = [
  '삼권분립은 - 사법부 입법부 행정부가 차례로 화면을 삼분할해서 나오게',
  '한 국가기관이 나라의 중요한 일을 - 하는동안 2,3,4 장면이 나오게',
  '마음대로 처리할 수 없게 - 독재자가 첫번째 장면 위에 세 건물에 연결된 꼭두각시 줄을 잡고 있는 장면',
  '서로를 견제하고',
  '균형을 이뤄내기 위한 것이다. - 원래 균형, 평화 느낌의 이미지는 그대로 두고 이미지에 떠있던 텍스트만 삭제',
] as const

const TEXT = mergeTypedSegments(SCRIPT_PARTS)

const base = import.meta.env.BASE_URL

/** public/demo 일러스트 (samgwon-1~6) */
const SLIDE_URLS = [1, 2, 3, 4, 5, 6].map((n) => `${base}demo/samgwon-${n}.png`)

/** 독재자·꼭두각시 줄 장면 (마음대로… 구간) */
const DICTATOR_URL = `${base}demo/samgwon-dictator.png`

/** 사용자용 하단 캡션(연출 메모와 무관) */
const CAPTIONS: { charIndex: number; text: string }[] = [
  { charIndex: 0, text: '사법·입법·행정, 세 권력이 가로로 나란히 나타나요' },
  { charIndex: 6, text: '한 기관이 나라의 일을 독점하면 어떤 모습일까요?' },
  { charIndex: 25, text: '힘이 한곳으로 쏠리면 이런 위험도 생겨요' },
  { charIndex: 39, text: '그래서 서로를 견제합니다' },
  { charIndex: 48, text: '균형과 평화를 지향하는 제도예요' },
]

/** 플레이어 「지금 보이는 그림」 단계(1~7) */
export const SEPARATION_DEMO_VISUAL_MILESTONES = [0, 6, 12, 18, 25, 39, 48] as const

/**
 * 삼권분립 데모 팩.
 * - 0·2·4: 「삼권분립은」 타이핑 중 사법·입법·행정이 화면 가로 삼분할로 등장.
 * - 6·12·18: 「한 국가기관이…」 구간에 상단 장면 2·3·4번 전환(세 분할은 숨김).
 * - 25: 「마음대로…」— 독재·꼭두각시 일러스트.
 * - 39: 「서로를 견제하고」— 견제 장면 + 하단에 세 부처 축소 복귀.
 * - 48: 「균형을…」— 평화·균형 느낌의 마지막 장면(samgwon-6, 이미지 내 텍스트 없음).
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
    {
      id: createId(),
      charIndex: 6,
      effects: [
        { kind: 'layerHide', layerId: layerJustice },
        { kind: 'layerHide', layerId: layerLegis },
        { kind: 'layerHide', layerId: layerExec },
        { kind: 'layerShow', layerId: layerStory },
        { kind: 'layerImage', layerId: layerStory, imageUrl: SLIDE_URLS[1]! },
      ],
    },
    {
      id: createId(),
      charIndex: 12,
      effects: [{ kind: 'layerImage', layerId: layerStory, imageUrl: SLIDE_URLS[2]! }],
    },
    {
      id: createId(),
      charIndex: 18,
      effects: [{ kind: 'layerImage', layerId: layerStory, imageUrl: SLIDE_URLS[3]! }],
    },
    {
      id: createId(),
      charIndex: 25,
      effects: [
        { kind: 'layerHide', layerId: layerStory },
        { kind: 'layerHide', layerId: layerJustice },
        { kind: 'layerHide', layerId: layerLegis },
        { kind: 'layerHide', layerId: layerExec },
        { kind: 'layerShow', layerId: layerDictator },
        { kind: 'layerImage', layerId: layerDictator, imageUrl: DICTATOR_URL },
      ],
    },
    {
      id: createId(),
      charIndex: 39,
      effects: [
        { kind: 'layerHide', layerId: layerDictator },
        { kind: 'layerShow', layerId: layerJustice },
        { kind: 'layerShow', layerId: layerLegis },
        { kind: 'layerShow', layerId: layerExec },
        {
          kind: 'layerTransform',
          layerId: layerJustice,
          x: 6,
          y: 68,
          width: 26,
        },
        {
          kind: 'layerTransform',
          layerId: layerLegis,
          x: 37,
          y: 68,
          width: 26,
        },
        {
          kind: 'layerTransform',
          layerId: layerExec,
          x: 68,
          y: 68,
          width: 26,
        },
        { kind: 'layerShow', layerId: layerStory },
        { kind: 'layerImage', layerId: layerStory, imageUrl: SLIDE_URLS[4]! },
      ],
    },
    {
      id: createId(),
      charIndex: 48,
      effects: [
        { kind: 'layerHide', layerId: layerJustice },
        { kind: 'layerHide', layerId: layerLegis },
        { kind: 'layerHide', layerId: layerExec },
        { kind: 'layerImage', layerId: layerStory, imageUrl: SLIDE_URLS[5]! },
        { kind: 'layerTransform', layerId: layerStory, x: 3, y: 4, width: 94 },
      ],
    },
  ]

  return {
    formatVersion: 1,
    id: 'demo-separation-three-powers',
    title: '삼권분립 — 장면별 연출 데모',
    description:
      '세 권력이 나란히 등장한 뒤, 이야기 장면과 견제·균형 장면이 타이핑에 맞춰 바뀝니다. (앱에 포함된 일러스트)',
    author: 'PicBook 데모',
    updatedAt: new Date().toISOString(),
    sentences: [
      {
        id: sentenceId,
        text: TEXT,
        layers: [
          {
            id: layerStory,
            label: '상단 장면',
            zIndex: 1,
            imageUrl: null,
            visible: false,
            opacity: 1,
            x: 5,
            y: 4,
            width: 90,
            scale: 1,
          },
          {
            id: layerJustice,
            label: '사법부',
            zIndex: 2,
            imageUrl: null,
            visible: false,
            opacity: 1,
            x: 1,
            y: 6,
            width: 32,
            scale: 1,
          },
          {
            id: layerLegis,
            label: '입법부',
            zIndex: 2,
            imageUrl: null,
            visible: false,
            opacity: 1,
            x: 34,
            y: 6,
            width: 32,
            scale: 1,
          },
          {
            id: layerExec,
            label: '행정부',
            zIndex: 2,
            imageUrl: null,
            visible: false,
            opacity: 1,
            x: 67,
            y: 6,
            width: 32,
            scale: 1,
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
          },
        ],
        cues,
        captions: CAPTIONS,
      },
    ],
  }
}
