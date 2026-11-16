import { computeAutoCueIndexes, createPanelSentenceBlock, normalizeCueIndexes } from '../lib/autoPanelSentence'
import { normalizeProductKey } from '../lib/productKey'
import type { PanelSentence } from '../types/customPicbook'
import type { ReadingPack } from '../types/pack'
import type { PicbookManifest } from '../types/picbookManifest'
import type { PicbookCatalogItem } from './picbookCatalog'
import { PICBOOK_CATEGORIES } from './picbookCategories'

const base = import.meta.env.BASE_URL

/** `_`로 시작하는 파일(예시·작업 중)은 싣지 않는다 */
const modules = import.meta.glob<PicbookManifest>('../content/picbooks/[!_]*.json', {
  eager: true,
  import: 'default',
})

const TONES = [
  'from-emerald-600 via-teal-500 to-cyan-600',
  'from-sky-600 via-blue-500 to-indigo-600',
  'from-rose-600 via-pink-500 to-fuchsia-600',
  'from-amber-600 via-orange-500 to-red-500',
  'from-violet-600 via-purple-500 to-indigo-600',
]

export function resolveContentImage(path: string): string {
  if (/^(https?:|data:|\/)/.test(path)) return path
  return `${base}${path}`
}

function manifestSentences(m: PicbookManifest): PanelSentence[] {
  return m.sentences.map((s, i) => {
    const images = s.images.map(resolveContentImage)
    return {
      id: `${m.id}-s${String(i + 1).padStart(3, '0')}`,
      text: s.text,
      images,
      cueIndexes: s.cueIndexes
        ? normalizeCueIndexes(s.text, s.cueIndexes, images.length)
        : computeAutoCueIndexes(s.text, images.length),
      ...(s.closingLine ? { closingLine: s.closingLine } : {}),
    }
  })
}

function manifestToCatalogItem(m: PicbookManifest, order: number): PicbookCatalogItem {
  const sentences = manifestSentences(m)
  const version = m.contentVersion ?? '1'
  const key = m.productKey ?? `PICBOOK-${m.id.toUpperCase()}`
  let pack: ReadingPack | null = null
  return {
    id: m.id,
    title: m.title,
    subtitle: m.subtitle ?? '',
    blurb: m.blurb ?? `${m.title} — 따라 쓰면 그림이 차례로 바뀝니다.`,
    author: 'PicBook',
    coverImage: resolveContentImage(m.cover ?? m.sentences[0]?.images[0] ?? 'favicon.svg'),
    category: PICBOOK_CATEGORIES.some((c) => c.id === m.category) ? m.category : 'etc',
    grade: m.grade,
    subject: m.subject,
    magazineTone: TONES[order % TONES.length],
    productKey: normalizeProductKey(key),
    productKeyDisplay: key,
    listPrice: m.listPrice ?? (m.free ? '₩0' : ''),
    free: m.free,
    contentVersion: version,
    loadPack: () => {
      pack ??= {
        formatVersion: 1,
        id: m.id,
        title: m.title,
        description: m.blurb ?? '',
        author: 'PicBook',
        typingStyle: 'stacked',
        contentVersion: version,
        updatedAt: '',
        sentences: sentences.map(createPanelSentenceBlock),
      }
      return pack
    },
  }
}

/** src/content/picbooks/*.json 으로 넣은 픽북 */
export const CONTENT_PICBOOKS: PicbookCatalogItem[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .filter(([, m]) => m && typeof m.id === 'string' && Array.isArray(m.sentences) && m.sentences.length > 0)
  .map(([, m], i) => manifestToCatalogItem(m, i))
