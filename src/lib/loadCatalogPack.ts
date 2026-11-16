import type { PicbookCatalogItem } from '../data/picbookCatalog'
import { useBookEditStore } from '../state/bookEditStore'
import { applyPackSentenceOverrides } from '../state/packSentenceOverrideStore'
import type { ReadingPack } from '../types/pack'
import { applyBookEdit } from './bookEdits'

/** 카탈로그 최신 contentVersion을 팩에 붙여 반환 */
export function loadCatalogPack(item: PicbookCatalogItem): ReadingPack {
  const pack = applyBookEdit(
    applyPackSentenceOverrides(item.loadPack(), item.id),
    useBookEditStore.getState().byBook[item.id],
  )
  return {
    ...pack,
    contentVersion: item.contentVersion,
  }
}

export function isSamePackContent(a: ReadingPack | null, b: ReadingPack | null): boolean {
  if (!a || !b) return false
  return a.id === b.id && a.contentVersion === b.contentVersion
}
