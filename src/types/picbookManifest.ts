import type { PicbookCategoryId } from '../data/picbookCategories'

/**
 * 대량 제작용 픽북 파일 형식 — src/content/picbooks/{id}.json
 * 에이전트(또는 사람)가 이 파일과 그림만 넣으면 코드 수정 없이 서점·편집창에 나타난다.
 * 자세한 규칙: docs/CONTENT_PIPELINE.md
 */
export type PicbookManifest = {
  /** 파일 이름과 같은 영문 id (예: proverbs-vol2) */
  id: string
  title: string
  subtitle?: string
  /** 서점 카드 설명 */
  blurb?: string
  category: PicbookCategoryId
  /** category가 curriculum일 때 1~6 */
  grade?: number
  /** category가 curriculum일 때 과목 (예: 사회) */
  subject?: string
  /** true면 제품키 없이 무료 */
  free?: boolean
  /** 유료일 때 제품키 */
  productKey?: string
  listPrice?: string
  /** 표지 그림. 없으면 첫 문장의 첫 그림 */
  cover?: string
  /** 내용을 고칠 때마다 올린다 — 이미 받은 사용자에게도 반영 */
  contentVersion?: string
  sentences: PicbookManifestSentence[]
}

export type PicbookManifestSentence = {
  /** 따라 쓸 문장 */
  text: string
  /** 그림 4~8장. public/ 기준 경로(예: picbooks/proverbs-vol2/s01-1.webp) 또는 https 주소 */
  images: string[]
  /** 그림별 등장 글자 위치. 비우면 문장 길이에 맞춰 자동으로 고르게 나눈다 */
  cueIndexes?: number[]
  /** 다 쓴 뒤 보여 줄 한 줄(뜻·교훈) */
  closingLine?: string
}
