import { useMemo } from 'react'
import { buildChunkVisualLayers } from '../lib/buildChunkVisualLayers'
import { getVisualDictionaryForBook, getVisualDictionaryForStory } from '../lib/storyVisualDictionary'
import type { LayerState } from '../types/pack'

/** 타자 진행에 따른 의미 청크 오버레이 레이어 */
export function useChunkVisualLayers(
  typed: string,
  bookId: string | undefined,
  storyId: string | undefined,
): LayerState[] {
  const entries = useMemo(() => {
    const byStory = getVisualDictionaryForStory(storyId)
    if (byStory.length > 0) return byStory
    return getVisualDictionaryForBook(bookId)
  }, [bookId, storyId])

  return useMemo(() => buildChunkVisualLayers(typed, entries), [typed, entries])
}
