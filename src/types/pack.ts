/**
 * PicBook 독서 팩 포맷.
 * - 문장마다 타이핑 선두 일치 글자 수(charIndex)를 기준으로 화면 큐가 적용된다.
 * - 되감기(백스페이스) 시 해당 글자 수 이하로 다시 계산한다.
 */

export const PACK_FORMAT_VERSION = 1 as const

/** 스테이지 위 한 겹(이미지 레이어) */
export type LayerState = {
  id: string
  label: string
  zIndex: number
  imageUrl: string | null
  visible: boolean
  opacity: number
  /** 스테이지 기준 위치·크기(%) */
  x: number
  y: number
  width: number
  scale: number
}

export type CueEffect =
  | { kind: 'layerShow'; layerId: string }
  | { kind: 'layerHide'; layerId: string }
  | { kind: 'layerImage'; layerId: string; imageUrl: string }
  | { kind: 'layerOpacity'; layerId: string; opacity: number }
  | {
      kind: 'layerTransform'
      layerId: string
      x?: number
      y?: number
      width?: number
      scale?: number
    }

/**
 * typedLength(선두 일치로 친 글자 수)가 charIndex 이상이 되는 순간,
 * 해당 큐의 effects가 순서대로 적용된다.
 */
export type Cue = {
  id: string
  charIndex: number
  effects: CueEffect[]
}

export type SentenceBlock = {
  id: string
  text: string
  /** 문장 진입 시 초기 레이어 구성 */
  layers: LayerState[]
  cues: Cue[]
}

export type ReadingPack = {
  formatVersion: typeof PACK_FORMAT_VERSION
  id: string
  title: string
  description: string
  author: string
  sentences: SentenceBlock[]
  updatedAt: string
}
