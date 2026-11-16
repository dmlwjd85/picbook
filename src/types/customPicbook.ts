import type { PicbookCategoryId } from '../data/picbookCategories'

/** 한 문장에 넣을 수 있는 그림 수 */
export const PANEL_MIN = 4
export const PANEL_MAX = 8

/**
 * 그림 여러 장이 타자 진행에 맞춰 차례로 바뀌는 문장.
 * images[i]는 타자 글자 수가 cueIndexes[i] 이상이 되면 나타난다.
 */
export type PanelSentence = {
  /** 고정 id — 타임라인·기록이 이 값을 기준으로 저장된다 */
  id: string
  /** 따라 쓸 문장 */
  text: string
  /** 그림 주소 4~8장 (순서대로 등장) */
  images: string[]
  /** 그림별 등장 글자 위치. images와 길이가 같고, 첫 값은 0, 오름차순 */
  cueIndexes: number[]
  /** 마지막 컷 아래에 보일 한 줄(뜻·교훈). 선택 */
  closingLine?: string
}

/** 관리자가 편집창에서 만든 PicBook */
export type CustomPicbookRecord = {
  id: string
  title: string
  subtitle: string
  blurb: string
  author: string
  productKey: string
  productKeyDisplay: string
  listPrice: string
  coverImage: string
  magazineTone: string
  /** 분류 — 없으면 '기타' */
  category?: PicbookCategoryId
  /** 교과 분류일 때 학년(1~6) */
  grade?: number
  /** 교과 분류일 때 과목(예: 사회) */
  subject?: string
  /** 제품키 없이 무료로 서재에 추가 */
  free?: boolean
  /** (이전 방식) 청크·시각 사전 연출용 문장 */
  sentences: string[]
  /** 문장 + 그림 4~8장 방식. 있으면 이쪽으로 재생한다 */
  panelSentences?: PanelSentence[]
  contentVersion: string
  createdAt: string
  updatedAt: string
}
