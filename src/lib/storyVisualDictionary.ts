import {
  resolveVisualDictionaryEntries,
  storyHasChunkDictionary,
} from './visualDictionaryRegistry'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

export function getVisualDictionaryForBook(bookId: string | undefined): VisualDictionaryEntry[] {
  return resolveVisualDictionaryEntries(undefined, bookId)
}

export function getVisualDictionaryForStory(storyId: string | undefined): VisualDictionaryEntry[] {
  return resolveVisualDictionaryEntries(storyId, undefined)
}

export function bookUsesChunkVisuals(bookId: string | undefined, packStoryId?: string): boolean {
  return storyHasChunkDictionary(packStoryId, bookId)
}
