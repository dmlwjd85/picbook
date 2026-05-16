import { createSeparationThreePowersDemoPack } from './separationThreePowersDemoPack'
import { normalizeProductKey } from '../lib/productKey'
import type { ReadingPack } from '../types/pack'

const base = import.meta.env.BASE_URL

export type PicbookCatalogItem = {
  id: string
  title: string
  subtitle: string
  /** 서점 카드 설명 */
  blurb: string
  author: string
  coverImage: string
  /** 매거진 테두리·책등 톤 (tailwind gradient 조각) */
  magazineTone: string
  /** 정규화된 제품키와 비교 */
  productKey: string
  listPrice: string
  /** 출판 예정 — 키 입력 불가 */
  comingSoon?: boolean
  loadPack: () => ReadingPack
}

/** 판매·배포용 카탈로그 (신규 팩은 여기에 등록) */
export const PICBOOK_CATALOG: PicbookCatalogItem[] = [
  {
    id: 'demo-separation-three-powers',
    title: '삼권분립',
    subtitle: '타자 연동 연출',
    blurb: '한 글자씩 타이핑할 때마다 사법·입법·행정 화면이 움직이는 역사 PicBook.',
    author: 'PicBook',
    coverImage: `${base}demo/samgwon-dictator.png`,
    magazineTone: 'from-amber-600 via-orange-500 to-rose-600',
    productKey: normalizeProductKey('PICBOOK-3POWERS-2026'),
    listPrice: '₩12,000',
    loadPack: createSeparationThreePowersDemoPack,
  },
  {
    id: 'coming-constitution',
    title: '대한민국 헌법 여정',
    subtitle: '출판 예정',
    blurb: '헌법 제정 과정을 그림과 타이핑으로 따라가는 PicBook. 곧 서점에 올라옵니다.',
    author: 'PicBook',
    coverImage: `${base}demo/samgwon-1.png`,
    magazineTone: 'from-slate-600 via-slate-500 to-slate-700',
    productKey: normalizeProductKey('PICBOOK-CONSTITUTION-TBA'),
    listPrice: '출판 예정',
    comingSoon: true,
    loadPack: createSeparationThreePowersDemoPack,
  },
  {
    id: 'coming-election',
    title: '선거와 민주주의',
    subtitle: '출판 예정',
    blurb: '투표·대표·견제의 흐름을 한 팩으로. 준비 중입니다.',
    author: 'PicBook',
    coverImage: `${base}demo/samgwon-5.png`,
    magazineTone: 'from-indigo-700 via-violet-600 to-purple-800',
    productKey: normalizeProductKey('PICBOOK-ELECTION-TBA'),
    listPrice: '출판 예정',
    comingSoon: true,
    loadPack: createSeparationThreePowersDemoPack,
  },
]

export function getCatalogItem(id: string): PicbookCatalogItem | undefined {
  return PICBOOK_CATALOG.find((b) => b.id === id)
}

export function findCatalogByProductKey(rawKey: string): PicbookCatalogItem | undefined {
  const key = normalizeProductKey(rawKey)
  if (!key) return undefined
  return PICBOOK_CATALOG.find((b) => !b.comingSoon && b.productKey === key)
}

export function getUnlockedCatalogItems(unlockedIds: string[]): PicbookCatalogItem[] {
  return PICBOOK_CATALOG.filter((b) => !b.comingSoon && unlockedIds.includes(b.id))
}
