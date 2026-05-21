import { create } from 'zustand'
import { TORTOISE_HARE_VISUAL_DICTIONARY } from '../data/tortoiseHareVisualDictionary'
import { parseVisualDictionaryCsv } from '../lib/parseVisualDictionaryCsv'
import {
  fetchAllVisualDictionary,
  isVisualDictionaryCloudEnabled,
  publishStoryDictionary,
} from '../lib/visualDictionaryFirebase'
import type { VisualDictionaryEntry, VisualPartOfSpeech } from '../types/visualDictionary'

type VisualDictionaryStore = {
  entries: VisualDictionaryEntry[]
  storyId: string
  search: string
  posFilter: VisualPartOfSpeech | 'all'
  loadedFromCloud: boolean
  setSearch: (q: string) => void
  setPosFilter: (f: VisualPartOfSpeech | 'all') => void
  setStoryId: (id: string) => void
  resetToTortoiseHareSeed: () => void
  importCsvText: (text: string) => { ok: true; count: number } | { ok: false; error: string }
  mergeEntries: (next: VisualDictionaryEntry[]) => void
  updateEntry: (wordId: string, patch: Partial<VisualDictionaryEntry>) => void
  assignEntryImageUrl: (wordId: string, imageUrl: string) => void
  loadFromCloud: () => Promise<void>
  publishToCloud: () => Promise<boolean>
}

function mergeById(base: VisualDictionaryEntry[], incoming: VisualDictionaryEntry[]): VisualDictionaryEntry[] {
  const map = new Map<string, VisualDictionaryEntry>()
  for (const e of base) map.set(e.word_id, e)
  for (const e of incoming) map.set(e.word_id, { ...map.get(e.word_id), ...e })
  return [...map.values()].sort((a, b) => a.word.localeCompare(b.word, 'ko'))
}

export const useVisualDictionaryStore = create<VisualDictionaryStore>((set, get) => ({
  entries: [...TORTOISE_HARE_VISUAL_DICTIONARY],
  storyId: 'tortoise-and-hare',
  search: '',
  posFilter: 'all',
  loadedFromCloud: false,

  setSearch: (search) => set({ search }),
  setPosFilter: (posFilter) => set({ posFilter }),
  setStoryId: (storyId) => set({ storyId }),

  resetToTortoiseHareSeed: () =>
    set({
      entries: [...TORTOISE_HARE_VISUAL_DICTIONARY],
      storyId: 'tortoise-and-hare',
      loadedFromCloud: false,
    }),

  importCsvText: (text) => {
    try {
      const parsed = parseVisualDictionaryCsv(text)
      if (parsed.length === 0) return { ok: false, error: '인식된 행이 없습니다. CSV 헤더·표제어(word)를 확인해 주세요.' }
      set((s) => ({ entries: mergeById(s.entries, parsed) }))
      return { ok: true, count: parsed.length }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'CSV 파싱 실패' }
    }
  },

  mergeEntries: (next) => set((s) => ({ entries: mergeById(s.entries, next) })),

  updateEntry: (wordId, patch) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.word_id === wordId ? { ...e, ...patch } : e)),
    })),

  assignEntryImageUrl: (wordId, imageUrl) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e.word_id === wordId ? { ...e, image_url: imageUrl.trim(), status: 'ready' as const } : e,
      ),
    })),

  loadFromCloud: async () => {
    if (!isVisualDictionaryCloudEnabled()) return
    const remote = await fetchAllVisualDictionary()
    if (remote.length > 0) {
      set({
        entries: mergeById(TORTOISE_HARE_VISUAL_DICTIONARY, remote),
        loadedFromCloud: true,
      })
    }
  },

  publishToCloud: async () => {
    const { entries, storyId } = get()
    return publishStoryDictionary(storyId, entries)
  },
}))

export function filterVisualEntries(
  entries: VisualDictionaryEntry[],
  search: string,
  posFilter: VisualPartOfSpeech | 'all',
): VisualDictionaryEntry[] {
  const q = search.trim().toLowerCase()
  return entries.filter((e) => {
    if (posFilter !== 'all' && e.part_of_speech !== posFilter) return false
    if (!q) return true
    const hay = [e.word, ...e.synonyms, ...e.tags, ...e.chunk_hints, e.file_name, e.image_direction]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}
