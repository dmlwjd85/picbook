import { PICBOOK_CATEGORIES, type PicbookCategoryId } from './picbookCategories'

/** 전체 이용권 — 모든 분류를 연다 */
export const PASS_ALL = 'all' as const
export type PassId = PicbookCategoryId | typeof PASS_ALL

export type PassProduct = {
  id: PassId
  label: string
  description: string
  /** 화면에 보일 가격. null이면 "가격 준비 중"으로 표시한다 — 판매가를 정한 뒤 채운다 */
  priceLabel: string | null
}

/** 판매 단위 = 분류. 가격은 여기 한곳에서만 바꾼다. */
export const PASS_PRODUCTS: PassProduct[] = [
  ...PICBOOK_CATEGORIES.filter((c) => c.id !== 'etc').map((c) => ({
    id: c.id as PassId,
    label: `${c.label} 이용권`,
    description: c.description,
    priceLabel: null,
  })),
  { id: PASS_ALL, label: '전체 이용권', description: '모든 분류의 픽북을 이용해요', priceLabel: null },
]

export function passLabel(id: string): string {
  return PASS_PRODUCTS.find((p) => p.id === id)?.label ?? id
}

/** 비로그인·미구매 체험에서 열어 주는 문장 수(책마다 앞에서부터) */
export const TRIAL_SENTENCE_COUNT = 2
