import { useMemo } from 'react'
import { buildChunkVisualLayers } from '../lib/buildChunkVisualLayers'
import { resolveVisualDictionaryEntries } from '../lib/visualDictionaryRegistry'
import { useVisualDictionaryStore } from '../state/visualDictionaryStore'
import type { LayerState } from '../types/pack'

/** 타자 진행에 따른 의미 청크 오버레이 레이어 */
export function useChunkVisualLayers(
  typed: string,
  bookId: string | undefined,
  storyId: string | undefined,
): LayerState[] {
  const editorStoryId = useVisualDictionaryStore((s) => s.storyId)
  const editorEntries = useVisualDictionaryStore((s) => s.entries)

  const entries = useMemo(() => {
    const resolved = resolveVisualDictionaryEntries(storyId, bookId)
    if (resolved.length > 0) return resolved
    if (editorStoryId === (storyId || bookId) && editorEntries.length > 0) return editorEntries
    return []
  }, [bookId, storyId, editorStoryId, editorEntries])

  return useMemo(() => buildChunkVisualLayers(typed, entries), [typed, entries])
}
