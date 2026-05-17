/**
 * PicBook 독서 팩 포맷.
 * - 문장마다 타이핑 선두 일치 글자 수(charIndex)를 기준으로 화면 큐가 적용된다.
 * - 되감기(백스페이스) 시 해당 글자 수 이하로 다시 계산한다.
 *
 * 제작 규칙(내부): 한 줄을 `타이핑할 내용 - 연출 설명`으로 적을 수 있다.
 * 하이픈 왼쪽만 사용자 타이핑에 쓰이고, 오른쪽은 연출 메모이므로 앱·JSON에는 넣지 않는다.
 * (`src/lib/typedScriptSegments.ts`의 takeTypingPart / mergeTypedSegments 참고)
 */

export const PACK_FORMAT_VERSION = 1 as const

/** 이미지 위에 겹치는 짧은 라벨(스테이지 기준 % 위치) */
export type LayerAnchorLabel = {
  text: string
  leftPct: number
  topPct: number
}

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
  /** 레이어 기준 가로·세로 이동(%, translate). 견제 장면 흔들림 등. */
  panX?: number
  panY?: number
  /**
   * true면 세로를 스테이지 전체에 맞춤(top 0, height 100%).
   * 삼분할·전체 덮기 등에 사용.
   */
  fillHeight?: boolean
  /**
   * 있으면 레이어 하단에 짧은 제목 막대(예: 사법부).
   * fillHeight와 함께 쓰면 이미지 위·제목 막대 아래 배치.
   */
  plateCaption?: string | null
  /** 이미지 위 절대 위치 라벨(견제 장면 손목 등). 없으면 표시하지 않음. */
  anchorLabels?: LayerAnchorLabel[] | null
  /** 이미지 위 스탬프(예: 빨간 X). */
  stampOverlay?: 'red-x' | null
}

export type CueEffect =
  | { kind: 'layerShow'; layerId: string }
  | { kind: 'layerHide'; layerId: string }
  | { kind: 'layerImage'; layerId: string; imageUrl: string }
  | { kind: 'layerOpacity'; layerId: string; opacity: number }
  | { kind: 'layerAnchorLabels'; layerId: string; labels: LayerAnchorLabel[] | null }
  | { kind: 'layerStampOverlay'; layerId: string; stamp: 'red-x' | null }
  | {
      kind: 'layerTransform'
      layerId: string
      x?: number
      y?: number
      width?: number
      scale?: number
      fillHeight?: boolean
      panX?: number
      panY?: number
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
  /** 사용자에게 보이는 타이핑 목표 문자열(연출 메모 미포함). */
  text: string
  /** 문장 진입 시 초기 레이어 구성 */
  layers: LayerState[]
  cues: Cue[]
  /**
   * 타이핑 글자 수가 charIndex 이상일 때 보일 짧은 한글 안내(스테이지 하단 오버레이).
   * charIndex는 보통 그림 큐와 맞춥니다.
   */
  captions?: { charIndex: number; text: string }[]
  /** 마지막 컷에서 스테이지 하단에 보일 짧은 교훈 대사 */
  closingLine?: string
}

export type ReadingPack = {
  formatVersion: typeof PACK_FORMAT_VERSION
  id: string
  title: string
  description: string
  author: string
  sentences: SentenceBlock[]
  updatedAt: string
  /** 카탈로그 팩 개정 번호 — 올리면 구매자에게 자동 반영 */
  contentVersion?: string
  /** minimal: 짧은 한글만, 안내·자막 최소화 / stacked: 연출 중앙·따라쓰기 하단 */
  typingStyle?: 'default' | 'minimal' | 'stacked'
}
