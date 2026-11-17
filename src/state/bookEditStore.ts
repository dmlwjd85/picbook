import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { fetchAllBookEdits, publishBookEdit } from '../lib/bookEditFirebase'
import { emptyBookEdit, type BookEdit } from '../lib/bookEdits'
import type { PanelSentence } from '../types/customPicbook'

type BookEditStore = {
  byBook: Record<string, BookEdit>
  /** 이 기기에서 고쳤지만 아직 배포하지 않은 책 */
  dirtyBookIds: string[]
  setPanel: (bookId: string, index: number, panel: PanelSentence) => void
  setText: (bookId: string, index: number, text: string) => void
  /** 문장 하나를 원본으로 되돌린다 */
  resetSentence: (bookId: string, index: number) => void
  /** 검수 완료 표시를 켜고 끈다 */
  setReviewed: (bookId: string, key: string, reviewed: boolean) => void
  /** 배포된 수정본을 받아 온다 — 배포 전인 내 수정은 덮어쓰지 않는다 */
  syncFromCloud: () => Promise<void>
  publish: (bookId: string) => Promise<boolean>
}

function touch(s: BookEditStore, bookId: string, next: BookEdit) {
  return {
    byBook: { ...s.byBook, [bookId]: { ...next, updatedAt: new Date().toISOString() } },
    dirtyBookIds: s.dirtyBookIds.includes(bookId) ? s.dirtyBookIds : [...s.dirtyBookIds, bookId],
  }
}

const safeStorage = {
  getItem: (name: string) => localStorage.getItem(name),
  removeItem: (name: string) => localStorage.removeItem(name),
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value)
    } catch (e) {
      console.warn('[PicBook] 수정본 저장 공간 부족', e)
    }
  },
}

export const useBookEditStore = create<BookEditStore>()(
  persist(
    (set, get) => ({
      byBook: {},
      dirtyBookIds: [],

      setPanel: (bookId, index, panel) =>
        set((s) => {
          const cur = s.byBook[bookId] ?? emptyBookEdit()
          const texts = { ...cur.texts }
          delete texts[index]
          return touch(s, bookId, { ...cur, texts, panels: { ...cur.panels, [index]: panel } })
        }),

      setText: (bookId, index, text) =>
        set((s) => {
          const cur = s.byBook[bookId] ?? emptyBookEdit()
          return touch(s, bookId, { ...cur, texts: { ...cur.texts, [index]: text } })
        }),

      resetSentence: (bookId, index) =>
        set((s) => {
          const cur = s.byBook[bookId] ?? emptyBookEdit()
          const panels = { ...cur.panels }
          const texts = { ...cur.texts }
          delete panels[index]
          delete texts[index]
          return touch(s, bookId, { ...cur, panels, texts })
        }),

      setReviewed: (bookId, key, reviewed) =>
        set((s) => {
          const cur = s.byBook[bookId] ?? emptyBookEdit()
          const rest = (cur.reviewed ?? []).filter((k) => k !== key)
          return touch(s, bookId, { ...cur, reviewed: reviewed ? [...rest, key] : rest })
        }),

      syncFromCloud: async () => {
        const remote = await fetchAllBookEdits()
        set((s) => {
          const byBook: Record<string, BookEdit> = {}
          for (const id of s.dirtyBookIds) {
            if (s.byBook[id]) byBook[id] = s.byBook[id]
          }
          for (const [id, edit] of Object.entries(remote)) {
            if (!s.dirtyBookIds.includes(id)) byBook[id] = edit
          }
          // 클라우드에 없고 손대지도 않은 책은 원본으로 (다른 관리자가 되돌린 경우)
          return { byBook }
        })
      },

      publish: async (bookId) => {
        const ok = await publishBookEdit(bookId, get().byBook[bookId] ?? emptyBookEdit())
        if (ok) set((s) => ({ dirtyBookIds: s.dirtyBookIds.filter((id) => id !== bookId) }))
        return ok
      },
    }),
    { name: 'picbook.book-edits.v1', storage: createJSONStorage(() => safeStorage) },
  ),
)
