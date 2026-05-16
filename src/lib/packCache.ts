import type { ReadingPack } from '../types/pack'

const cache = new Map<string, ReadingPack>()

/** contentVersion별 팩 인스턴스 재사용 — 모바일 멈춤 방지 */
export function getCachedPack(cacheKey: string, factory: () => ReadingPack): ReadingPack {
  const hit = cache.get(cacheKey)
  if (hit) return hit
  const pack = factory()
  cache.set(cacheKey, pack)
  return pack
}

export function clearPackCache(): void {
  cache.clear()
}
