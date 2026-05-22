import { useEffect, useMemo, useRef } from 'react'
import { buildChunkVisualLayers } from '../lib/buildChunkVisualLayers'
import { resolveVisualDictionaryEntries } from '../lib/visualDictionaryRegistry'
import { useVisualDictionaryStore } from '../state/visualDictionaryStore'
import type { LayerState } from '../types/pack'

/** 타자 진행에 따른 의미 청크 오버레이 — 다음 이미지 전까지 마지막 장면 유지 */
export function useChunkVisualLayers(
  typed: string,
  bookId: string | undefined,
  storyId: string | undefined,
  resetKey?: string,
): LayerState[] {
  const editorStoryId = useVisualDictionaryStore((s) => s.storyId)
  const editorEntries = useVisualDictionaryStore((s) => s.entries)
  const lastRef = useRef<LayerState[]>([])

  useEffect(() => {
    lastRef.current = []
  }, [resetKey, bookId, storyId])

  const entries = useMemo(() => {
    const resolved = resolveVisualDictionaryEntries(storyId, bookId)
    if (resolved.length > 0) return resolved
    if (editorStoryId === (storyId || bookId) && editorEntries.length > 0) return editorEntries
    return []
  }, [bookId, storyId, editorStoryId, editorEntries])

  return useMemo(() => {
    if (!typed.trim()) {
      lastRef.current = []
      return []
    }

    const next = buildChunkVisualLayers(typed, entries)
    if (next.length > 0) {
      lastRef.current = next
      return next
    }

    return lastRef.current
  }, [typed, entries])
}
