import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createId } from '../lib/ids'
import {
  createEmptySentenceTimeline,
  type CharFrameEdit,
  type SentenceTimeline,
  type TimelineInsert,
} from '../types/timeline'

const STORAGE_KEY = 'picbook.master.timeline.v2'

type TimelineStore = {
  /** bookId → sentenceId → 타임라인 */
  byBook: Record<string, Record<string, SentenceTimeline>>
  getTimeline: (bookId: string, sentenceId: string) => SentenceTimeline
  setFrameEdit: (bookId: string, sentenceId: string, charIndex: number, patch: Partial<CharFrameEdit>) => void
  clearFrameAt: (bookId: string, sentenceId: string, charIndex: number) => void
  addInsert: (bookId: string, sentenceId: string, afterCharIndex: number) => string
  updateInsert: (bookId: string, sentenceId: string, insertId: string, patch: Partial<TimelineInsert>) => void
  removeInsert: (bookId: string, sentenceId: string, insertId: string) => void
  setBgm: (bookId: string, sentenceId: string, bgm: SentenceTimeline['bgm'] | null) => void
  clearSentence: (bookId: string, sentenceId: string) => void
  clearBook: (bookId: string) => void
  /** Firebase 배포본을 로컬에 병합 */
  mergePublishedBook: (bookId: string, timelines: Record<string, SentenceTimeline>) => void
}

function ensureSentence(
  byBook: Record<string, Record<string, SentenceTimeline>>,
  bookId: string,
  sentenceId: string,
): SentenceTimeline {
  if (!byBook[bookId]) byBook[bookId] = {}
  if (!byBook[bookId][sentenceId]) {
    byBook[bookId][sentenceId] = createEmptySentenceTimeline()
  }
  return byBook[bookId][sentenceId]
}

export const usePicbookTimelineStore = create<TimelineStore>()(
  persist(
    (set, get) => ({
      byBook: {},

      getTimeline: (bookId, sentenceId) => {
        return get().byBook[bookId]?.[sentenceId] ?? createEmptySentenceTimeline()
      },

      setFrameEdit: (bookId, sentenceId, charIndex, patch) =>
        set((s) => {
          const byBook = { ...s.byBook }
          const book = { ...(byBook[bookId] ?? {}) }
          const tl = { ...ensureSentence(byBook, bookId, sentenceId) }
          const frameEdits = { ...tl.frameEdits }
          const prev = frameEdits[charIndex] ?? {}
          const next = { ...prev, ...patch }

          if (patch.textOverlay !== undefined) {
            const t = patch.textOverlay.text.trim()
            if (!t) {
              const { textOverlay: _t, ...rest } = next
              Object.assign(next, rest)
            } else {
              next.textOverlay = {
                text: t,
                position: patch.textOverlay.position ?? prev.textOverlay?.position ?? 'top',
              }
            }
          }

          const sfxEmpty = !next.sfx?.url && !next.sfx?.customAudioId
          const empty =
            !next.imageUrl &&
            !next.customImageId &&
            next.scale === undefined &&
            next.panX === undefined &&
            next.panY === undefined &&
            !next.transition &&
            !next.staging &&
            !next.textOverlay &&
            sfxEmpty

          if (empty) {
            delete frameEdits[charIndex]
          } else {
            frameEdits[charIndex] = next
          }

          book[sentenceId] = { ...tl, frameEdits }
          byBook[bookId] = book
          return { byBook }
        }),

      clearFrameAt: (bookId, sentenceId, charIndex) =>
        set((s) => {
          const tl = s.byBook[bookId]?.[sentenceId]
          if (!tl?.frameEdits[charIndex]) return s
          const byBook = { ...s.byBook }
          const book = { ...byBook[bookId]! }
          const frameEdits = { ...tl.frameEdits }
          delete frameEdits[charIndex]
          book[sentenceId] = { ...tl, frameEdits }
          byBook[bookId] = book
          return { byBook }
        }),

      addInsert: (bookId, sentenceId, afterCharIndex) => {
        const id = createId()
        set((s) => {
          const byBook = { ...s.byBook }
          const book = { ...(byBook[bookId] ?? {}) }
          const tl = { ...ensureSentence(byBook, bookId, sentenceId) }
          const inserts = [
            ...tl.inserts,
            { id, afterCharIndex, scale: 1, panX: 0, panY: 0 },
          ]
          book[sentenceId] = { ...tl, inserts }
          byBook[bookId] = book
          return { byBook }
        })
        return id
      },

      updateInsert: (bookId, sentenceId, insertId, patch) =>
        set((s) => {
          const tl = s.byBook[bookId]?.[sentenceId]
          if (!tl) return s
          const byBook = { ...s.byBook }
          const book = { ...byBook[bookId]! }
          book[sentenceId] = {
            ...tl,
            inserts: tl.inserts.map((ins) => (ins.id === insertId ? { ...ins, ...patch } : ins)),
          }
          byBook[bookId] = book
          return { byBook }
        }),

      removeInsert: (bookId, sentenceId, insertId) =>
        set((s) => {
          const tl = s.byBook[bookId]?.[sentenceId]
          if (!tl) return s
          const byBook = { ...s.byBook }
          const book = { ...byBook[bookId]! }
          book[sentenceId] = {
            ...tl,
            inserts: tl.inserts.filter((i) => i.id !== insertId),
          }
          byBook[bookId] = book
          return { byBook }
        }),

      setBgm: (bookId, sentenceId, bgm) =>
        set((s) => {
          const byBook = { ...s.byBook }
          const book = { ...(byBook[bookId] ?? {}) }
          const tl = { ...ensureSentence(byBook, bookId, sentenceId) }
          book[sentenceId] = { ...tl, bgm: bgm ?? undefined }
          byBook[bookId] = book
          return { byBook }
        }),

      clearSentence: (bookId, sentenceId) =>
        set((s) => {
          const book = s.byBook[bookId]
          if (!book?.[sentenceId]) return s
          const byBook = { ...s.byBook }
          const nextBook = { ...book }
          delete nextBook[sentenceId]
          if (Object.keys(nextBook).length === 0) {
            delete byBook[bookId]
          } else {
            byBook[bookId] = nextBook
          }
          return { byBook }
        }),

      clearBook: (bookId) =>
        set((s) => {
          if (!s.byBook[bookId]) return s
          const byBook = { ...s.byBook }
          delete byBook[bookId]
          return { byBook }
        }),

      mergePublishedBook: (bookId, timelines) =>
        set((s) => {
          const byBook = { ...s.byBook }
          const book = { ...(byBook[bookId] ?? {}) }
          for (const [sentenceId, tl] of Object.entries(timelines)) {
            if (tl?.version === 2) book[sentenceId] = tl
          }
          byBook[bookId] = book
          return { byBook }
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ byBook: s.byBook }),
    },
  ),
)
