import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReadingPack, SentenceBlock } from '../types/pack'

/** 마스터 편집기 — 카탈로그 팩 문장(타이핑 텍스트) 로컬 덮어쓰기 */
type PackSentenceOverrideStore = {
  byBook: Record<string, Record<number, string>>
  setSentenceText: (bookId: string, sentenceIndex: number, text: string) => void
  clearSentence: (bookId: string, sentenceIndex: number) => void
  clearBook: (bookId: string) => void
}

export const usePackSentenceOverrideStore = create<PackSentenceOverrideStore>()(
  persist(
    (set) => ({
      byBook: {},
      setSentenceText: (bookId, sentenceIndex, text) =>
        set((s) => ({
          byBook: {
            ...s.byBook,
            [bookId]: { ...(s.byBook[bookId] ?? {}), [sentenceIndex]: text },
          },
        })),
      clearSentence: (bookId, sentenceIndex) =>
        set((s) => {
          const book = { ...(s.byBook[bookId] ?? {}) }
          delete book[sentenceIndex]
          return { byBook: { ...s.byBook, [bookId]: book } }
        }),
      clearBook: (bookId) =>
        set((s) => {
          const next = { ...s.byBook }
          delete next[bookId]
          return { byBook: next }
        }),
    }),
    { name: 'picbook.pack-sentence-overrides.v1' },
  ),
)

export function applyPackSentenceOverrides(pack: ReadingPack, bookId: string): ReadingPack {
  const overrides = usePackSentenceOverrideStore.getState().byBook[bookId]
  if (!overrides || Object.keys(overrides).length === 0) return pack

  const sentences: SentenceBlock[] = pack.sentences.map((s, i) => {
    const text = overrides[i]?.trim()
    return text ? { ...s, text } : s
  })

  return { ...pack, sentences }
}
