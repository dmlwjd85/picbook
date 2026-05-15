import { createId } from '../lib/ids'
import type { ReadingPack } from '../types/pack'

/** 사용자가 제시한 문장(띄어쓰기 포함) — 길이 64자 */
const TEXT =
  '삼권분립은 한 국가기관이 나라의 중요한 일을 마음대로 처리할 수 없게 서로를 견제하고 균형을 이뤄내기 위한 것이다.'

const base = import.meta.env.BASE_URL

/** 이 저장소에 포함된 삼권분립 일러스트 6장 (public/demo) */
const SLIDE_URLS = [1, 2, 3, 4, 5, 6].map((n) => `${base}demo/samgwon-${n}.png`)

/** 타이핑 글자 수 구간(대략 6등분)마다 그림이 바뀜 */
const CHAR_MILESTONES = [0, 11, 22, 32, 42, 52] as const

/**
 * 삼권분립 문장 1개 + 화면 그림 6장 전환 데모 팩.
 * - 선두 일치 글자 수가 각 이정표 이상이 될 때마다 같은 레이어의 이미지 URL만 갈아끼움.
 */
export function createSeparationThreePowersDemoPack(): ReadingPack {
  const sentenceId = createId()
  const layerId = createId()

  const cues = CHAR_MILESTONES.map((charIndex, i) => ({
    id: createId(),
    charIndex,
    effects:
      i === 0
        ? [
            { kind: 'layerImage' as const, layerId, imageUrl: SLIDE_URLS[i]! },
            { kind: 'layerShow' as const, layerId },
          ]
        : [{ kind: 'layerImage' as const, layerId, imageUrl: SLIDE_URLS[i]! }],
  }))

  return {
    formatVersion: 1,
    id: 'demo-separation-three-powers',
    title: '삼권분립 — 한 문장·그림 6장',
    description:
      '한 문장을 따라 치면, 글자 수에 맞춰 그림이 여섯 번 바뀝니다. (앱에 포함된 일러스트)',
    author: 'PicBook 데모',
    updatedAt: new Date().toISOString(),
    sentences: [
      {
        id: sentenceId,
        text: TEXT,
        layers: [
          {
            id: layerId,
            label: '삽화',
            zIndex: 1,
            imageUrl: null,
            visible: false,
            opacity: 1,
            x: 4,
            y: 6,
            width: 92,
            scale: 1,
          },
        ],
        cues,
      },
    ],
  }
}
