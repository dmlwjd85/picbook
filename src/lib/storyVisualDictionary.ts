import {
  TORTOISE_HARE_STORY_ID,
  TORTOISE_HARE_VISUAL_DICTIONARY,
} from '../data/tortoiseHareVisualDictionary'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

const BY_BOOK: Record<string, VisualDictionaryEntry[]> = {
  'tortoise-and-hare': TORTOISE_HARE_VISUAL_DICTIONARY,
}

const BY_STORY: Record<string, VisualDictionaryEntry[]> = {
  [TORTOISE_HARE_STORY_ID]: TORTOISE_HARE_VISUAL_DICTIONARY,
}

/** 팩·작품 id → 시각 사전 항목 */
export function getVisualDictionaryForBook(bookId: string | undefined): VisualDictionaryEntry[] {
  if (!bookId) return []
  return BY_BOOK[bookId] ?? []
}

export function getVisualDictionaryForStory(storyId: string | undefined): VisualDictionaryEntry[] {
  if (!storyId) return []
  if (BY_STORY[storyId]) return BY_STORY[storyId]!
  return BY_BOOK[storyId] ?? []
}

export function bookUsesChunkVisuals(bookId: string | undefined, packStoryId?: string): boolean {
  return Boolean(packStoryId || (bookId && BY_BOOK[bookId]))
}
