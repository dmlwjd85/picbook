import { collectPlayImageUrls } from './collectPlayImageUrls'
import type { ReadingPack } from '../types/pack'

const cache = new Map<string, Promise<void>>()

function preloadOne(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    const done = () => resolve()
    img.onload = done
    img.onerror = done
    img.src = url
    if (img.complete) done()
  })
}

/** 챕터(책) 시작 전 연출 이미지를 브라우저에 미리 받아 둠 */
export function preloadPlayImages(pack: ReadingPack, bookId: string): Promise<void> {
  const key = `${bookId}@${pack.contentVersion ?? pack.updatedAt ?? pack.id}`
  const existing = cache.get(key)
  if (existing) return existing

  const urls = collectPlayImageUrls(pack, bookId)
  const job = (async () => {
    const batch = 8
    for (let i = 0; i < urls.length; i += batch) {
      await Promise.all(urls.slice(i, i + batch).map(preloadOne))
    }
  })()

  cache.set(key, job)
  return job
}
