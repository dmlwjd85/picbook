import { createElementaryProverbsPack } from './elementaryProverbsPack'
import { createSeparationThreePowersDemoPack } from './separationThreePowersDemoPack'
import { createTortoiseHarePack } from './tortoiseHarePack'
import { createCustomPicbookPack } from '../lib/createCustomPicbookPack'
import { normalizeProductKey } from '../lib/productKey'
import { getPackContentVersion } from './packContentVersions'
import { useCustomPicbookStore } from '../state/customPicbookStore'
import type { CustomPicbookRecord } from '../types/customPicbook'
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
  /** 마스터·배포용 표시 키 */
  productKeyDisplay: string
  listPrice: string
  /** 출판 예정 — 키 입력 불가 */
  comingSoon?: boolean
  /** 팩 수정 시 올리면 구매자 재생에 자동 반영 */
  contentVersion: string
  loadPack: () => ReadingPack
}

/** 판매·배포용 카탈로그 (신규 팩은 여기에 등록) */
export const PICBOOK_CATALOG: PicbookCatalogItem[] = [
  {
    id: 'demo-separation-three-powers',
    title: '삼권분립',
    subtitle: '타자 연동 연출',
    blurb: '권력분립·삼권 견제·국민의 자유와 권리까지, 타이핑에 맞춰 이어지는 역사 PicBook(3문장).',
    author: 'PicBook',
    coverImage: `${base}demo/powers/powers-cover.png`,
    magazineTone: 'from-amber-600 via-orange-500 to-rose-600',
    productKey: normalizeProductKey('PICBOOK-3POWERS-2026'),
    productKeyDisplay: 'PICBOOK-3POWERS-2026',
    listPrice: '₩12,000',
    contentVersion: getPackContentVersion('demo-separation-three-powers'),
    loadPack: createSeparationThreePowersDemoPack,
  },
  {
    id: 'elementary-proverbs',
    title: '초등 필수 속담',
    subtitle: '가는 말이 고와야 오는 말이 곱다',
    blurb:
      '속담 문장을 따라 쓰면 6컷 만화가 순서대로 바뀝니다. 30편 — 그림의 떡·금강산도 식후경·누워서 떡 먹기 등.',
    author: 'PicBook',
    coverImage: `${base}demo/proverbs/proverbs-cover.png`,
    magazineTone: 'from-emerald-600 via-teal-500 to-sky-600',
    productKey: normalizeProductKey('PICBOOK-PROVERBS-2026'),
    productKeyDisplay: 'PICBOOK-PROVERBS-2026',
    listPrice: '₩9,000',
    contentVersion: getPackContentVersion('elementary-proverbs'),
    loadPack: createElementaryProverbsPack,
  },
  {
    id: 'tortoise-and-hare',
    title: '토끼와 거북이',
    subtitle: '의미 청크·수어형 시각 사전 데모',
    blurb:
      '타이핑한 단어·어절마다 투명 PNG가 겹쳐집니다. 숲·토끼·거북이·달리다·느리다·기쁘다 등 레고 블록 연출.',
    author: 'PicBook',
    coverImage: `${base}demo/tortoise-hare-cover.png`,
    magazineTone: 'from-lime-600 via-emerald-500 to-teal-600',
    productKey: normalizeProductKey('PICBOOK-TORTOISE-2026'),
    productKeyDisplay: 'PICBOOK-TORTOISE-2026',
    listPrice: '₩1,000,000',
    contentVersion: getPackContentVersion('tortoise-and-hare'),
    loadPack: createTortoiseHarePack,
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
    productKeyDisplay: '—',
    listPrice: '출판 예정',
    comingSoon: true,
    contentVersion: getPackContentVersion('coming-constitution'),
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
    productKeyDisplay: '—',
    listPrice: '출판 예정',
    comingSoon: true,
    contentVersion: getPackContentVersion('coming-election'),
    loadPack: createSeparationThreePowersDemoPack,
  },
]

export function customRecordToCatalogItem(meta: CustomPicbookRecord): PicbookCatalogItem {
  return {
    id: meta.id,
    title: meta.title,
    subtitle: meta.subtitle,
    blurb: meta.blurb,
    author: meta.author,
    coverImage: meta.coverImage,
    magazineTone: meta.magazineTone,
    productKey: meta.productKey,
    productKeyDisplay: meta.productKeyDisplay,
    listPrice: meta.listPrice,
    contentVersion: meta.contentVersion,
    loadPack: () => createCustomPicbookPack(meta),
  }
}

/** 편집·재생용 — 출판 예정 제외 + 마스터가 만든 픽북 */
export function getEditableCatalogItems(): PicbookCatalogItem[] {
  const custom = useCustomPicbookStore.getState().books.map(customRecordToCatalogItem)
  return [...PICBOOK_CATALOG.filter((b) => !b.comingSoon), ...custom]
}

export function getCatalogItem(id: string): PicbookCatalogItem | undefined {
  const custom = useCustomPicbookStore.getState().books.find((b) => b.id === id)
  if (custom) return customRecordToCatalogItem(custom)
  return PICBOOK_CATALOG.find((b) => b.id === id)
}

export function findCatalogByProductKey(rawKey: string): PicbookCatalogItem | undefined {
  const key = normalizeProductKey(rawKey)
  if (!key) return undefined
  const custom = useCustomPicbookStore
    .getState()
    .books.find((b) => b.productKey === key)
  if (custom) return customRecordToCatalogItem(custom)
  return PICBOOK_CATALOG.find((b) => !b.comingSoon && b.productKey === key)
}

export function getUnlockedCatalogItems(unlockedIds: string[]): PicbookCatalogItem[] {
  return getEditableCatalogItems().filter((b) => unlockedIds.includes(b.id))
}
