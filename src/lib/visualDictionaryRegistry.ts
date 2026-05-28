import {
  SEPARATION_CHUNK_VISUAL_DICTIONARY,
  SEPARATION_STORY_ID,
} from '../data/separationChunkVisualDictionary'
import {
  TORTOISE_HARE_STORY_ID,
  TORTOISE_HARE_VISUAL_DICTIONARY,
} from '../data/tortoiseHareVisualDictionary'
import { useVisualDictionaryStore } from '../state/visualDictionaryStore'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

const STATIC_BY_STORY: Record<string, VisualDictionaryEntry[]> = {
  [TORTOISE_HARE_STORY_ID]: TORTOISE_HARE_VISUAL_DICTIONARY,
  [SEPARATION_STORY_ID]: SEPARATION_CHUNK_VISUAL_DICTIONARY,
}

/** storyId·bookId → 시각 사전 (커스텀 픽북은 편집기 store) */
export function resolveVisualDictionaryEntries(
  storyId: string | undefined,
  bookId: string | undefined,
): VisualDictionaryEntry[] {
  const sid = storyId?.trim() || bookId?.trim()
  if (!sid) return []

  if (STATIC_BY_STORY[sid]) return STATIC_BY_STORY[sid]!

  const editorStoryId = useVisualDictionaryStore.getState().storyId
  const editorEntries = useVisualDictionaryStore.getState().entries
  if (editorStoryId === sid && editorEntries.length > 0) {
    return editorEntries
  }

  return []
}

export function storyHasChunkDictionary(storyId: string | undefined, bookId: string | undefined): boolean {
  return resolveVisualDictionaryEntries(storyId, bookId).length > 0
}
