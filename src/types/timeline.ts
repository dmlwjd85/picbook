import type { SceneStaging, SceneTransition, TextOverlayPosition } from './sceneEdit'

/** 한 글자(프레임) 단위 연출 — 해당 글자까지 입력했을 때 적용(누적 병합) */
export type CharFrameEdit = {
  /** 적용할 레이어 id(삼분할 등 다중 레이어). 없으면 주 레이어 자동 */
  layerId?: string
  /** 패널 URL 대신 쓸 이미지(패널 목록·URL) */
  imageUrl?: string
  /** IndexedDB에 저장한 커스텀 이미지 키 */
  customImageId?: string
  /** 확대·축소 배율 (1 = 기본) */
  scale?: number
  panX?: number
  panY?: number
  transition?: SceneTransition
  staging?: SceneStaging
  textOverlay?: {
    text: string
    position: TextOverlayPosition
  }
  /** 프레임 진입 시 효과음 */
  sfx?: {
    url?: string
    customAudioId?: string
    volume?: number
  }
}

/** 글자 K 다음에 끼워 넣는 삽입 컷 */
export type TimelineInsert = {
  id: string
  /** 이 글자 인덱스 직후부터 표시 (typedLength > afterCharIndex) */
  afterCharIndex: number
  customImageId?: string
  imageUrl?: string
  scale?: number
  panX?: number
  panY?: number
  transition?: SceneTransition
  staging?: SceneStaging
}

/** 문장별 타임라인 (버전 2) */
export type SentenceTimeline = {
  version: 2
  frameEdits: Record<number, CharFrameEdit>
  inserts: TimelineInsert[]
  /** 배경 음악(선택) */
  bgm?: {
    url?: string
    customAudioId?: string
    volume: number
    loop: boolean
  }
}

export const TIMELINE_SCHEMA_VERSION = 2 as const

export function createEmptySentenceTimeline(): SentenceTimeline {
  return { version: TIMELINE_SCHEMA_VERSION, frameEdits: {}, inserts: [] }
}
