import { extractPanelUrlsFromSentence } from './extractPanelUrls'
import { resolveVisualDictionaryEntries } from './visualDictionaryRegistry'
import { resolveVisualImageUrl } from './visualDictionaryPaths'
import type { ReadingPack } from '../types/pack'

/** 책 한 권 재생에 쓰일 이미지 URL 수집(중복 제거) */
export function collectPlayImageUrls(pack: ReadingPack, bookId: string): string[] {
  const seen = new Set<string>()
  const urls: string[] = []

  const add = (url: string | null | undefined) => {
    const u = url?.trim()
    if (!u || seen.has(u)) return
    seen.add(u)
    urls.push(u)
  }

  for (const sentence of pack.sentences) {
    for (const u of extractPanelUrlsFromSentence(sentence)) add(u)
    for (const layer of sentence.layers) add(layer.imageUrl)
  }

  const entries = resolveVisualDictionaryEntries(pack.visualDictionaryStoryId, bookId)
  for (const entry of entries) {
    if (entry.status === 'deprecated') continue
    add(resolveVisualImageUrl(entry))
  }

  return urls
}
