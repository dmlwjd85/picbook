import { createId } from '../lib/ids'
import type { Cue, ReadingPack } from '../types/pack'

/** 타이핑 문장(끝의 「균형을 이뤄내기 위한 것이다.」 구절은 제외) */
const TEXT =
  '삼권분립은 한 국가기관이 나라의 중요한 일을 마음대로 처리할 수 없게 서로를 견제하고'

const base = import.meta.env.BASE_URL

/** public/demo 일러스트 (samgwon-1~6) */
const SLIDE_URLS = [1, 2, 3, 4, 5, 6].map((n) => `${base}demo/samgwon-${n}.png`)

/** 독재자·꼭두각시 줄 장면 (마음대로… 구간) */
const DICTATOR_URL = `${base}demo/samgwon-dictator.png`

/**
 * 하단 오버레이 캡션 — 「균형을 이뤄내기 위한 것이다.」에 대응하는 문구는 넣지 않음.
 * (해당 문장 자체를 팩에서 삭제함)
 */
const CAPTIONS: { charIndex: number; text: string }[] = [
  { charIndex: 0, text: '「삼권분립은」을 치는 동안 사법·입법·행정이 차례로 나타나요' },
  { charIndex: 6, text: '「한 국가기관이…」를 치는 동안 위 그림이 2·3·4번 장면으로 바뀝니다' },
  { charIndex: 25, text: '「마음대로…」 구간 — 세 부처 위에 꼭두각시 줄을 잡은 권력' },
  { charIndex: 39, text: '「서로를 견제하고」— 견제로 막아 내는 삼권분립' },
]

/** 플레이어 화면의 「지금 보이는 그림」 단계(1~6)용 이정표 */
export const SEPARATION_DEMO_VISUAL_MILESTONES = [0, 6, 12, 18, 25, 39] as const

/**
 * 삼권분립 데모 팩.
 * - 0~4: 「삼권분립은」 타이핑 중 사법(0) → 입법(2) → 행정(4) 순으로 하단 건물 등장.
 * - 6·12·18: 「한 국가기관이 나라의 중요한 일을」 구간에 맞춰 상단 그림을 2·3·4번 장면으로 전환.
 * - 25: 「마음대로 처리할 수 없게」— 첫 장면(권력 분립) 주제 위에 독재자·줄 일러스트 레이어 추가.
 * - 39: 견제 구간에서 독재자 장면을 걷고 견제 일러스트로 전환.
 */
export function createSeparationThreePowersDemoPack(): ReadingPack {
  const sentenceId = createId()
  const layerStory = createId()
  const layerJustice = createId()
  const layerLegis = createId()
  const layerExec = createId()
  const layerDictator = createId()

  // 사법·입법·행정 썸네일: 파일 4·2·3번 일러스트 사용(좌→우: 사법·입법·행정).
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
        { kind: 'layerShow', layerId: layerStory },
        { kind: 'layerImage', layerId: layerStory, imageUrl: SLIDE_URLS[4]! },
      ],
    },
  ]

  return {
    formatVersion: 1,
    id: 'demo-separation-three-powers',
    title: '삼권분립 — 장면별 연출 데모',
    description:
      '「삼권분립은」 동안 사법·입법·행정이 차례로 나타나고, 「한 국가기관이…」 구간에 2·3·4번 장면이 이어지며, 「마음대로…」에서 독재자·꼭두각시 장면이 겹칩니다. (앱에 포함된 일러스트)',
    author: 'PicBook 데모',
    updatedAt: new Date().toISOString(),
    sentences: [
      {
        id: sentenceId,
        text: TEXT,
        layers: [
          {
            id: layerStory,
            label: '상단 장면(2·3·4·견제)',
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
            x: 6,
            y: 68,
            width: 26,
            scale: 1,
          },
          {
            id: layerLegis,
            label: '입법부',
            zIndex: 2,
            imageUrl: null,
            visible: false,
            opacity: 1,
            x: 37,
            y: 68,
            width: 26,
            scale: 1,
          },
          {
            id: layerExec,
            label: '행정부',
            zIndex: 2,
            imageUrl: null,
            visible: false,
            opacity: 1,
            x: 68,
            y: 68,
            width: 26,
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
