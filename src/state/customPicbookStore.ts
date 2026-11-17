import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CustomPicbookRecord } from '../types/customPicbook'
import { fetchAllCustomPicbooks, publishCustomPicbook } from '../lib/customPicbookFirebase'
import { normalizeProductKey } from '../lib/productKey'
import { createId } from '../lib/ids'

const base = import.meta.env.BASE_URL

/**
 * 체험 모드에서는 그림이 data URL로 들어가 저장 공간(약 5MB)을 넘길 수 있다.
 * 넘쳐도 편집 화면이 멈추지 않게 하고, 저장 실패를 알린다.
 */
let quotaWarned = false
const safeLocalStorage = {
  getItem: (name: string) => localStorage.getItem(name),
  removeItem: (name: string) => localStorage.removeItem(name),
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value)
    } catch (e) {
      console.warn('[PicBook] 픽북 저장 공간 부족', e)
      if (!quotaWarned) {
        quotaWarned = true
        window.alert(
          '이 기기의 저장 공간이 가득 차서 방금 변경은 새로고침하면 사라집니다.\nFirebase Storage를 연결하면 그림이 클라우드에 저장되어 이 문제가 없어집니다.',
        )
      }
    }
  },
}

type CustomPicbookStore = {
  books: CustomPicbookRecord[]
  hydratedFromCloud: boolean
  addBook: (draft: Omit<CustomPicbookRecord, 'createdAt' | 'updatedAt' | 'contentVersion'>) => CustomPicbookRecord
  updateBook: (id: string, patch: Partial<CustomPicbookRecord>) => void
  removeBook: (id: string) => void
  bumpVersion: (id: string) => void
  syncFromCloud: () => Promise<void>
  publishBook: (id: string) => Promise<boolean>
}

function slugId(title: string): string {
  const baseId = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .slice(0, 40)
  return baseId || `picbook-${createId().slice(0, 8)}`
}

export const useCustomPicbookStore = create<CustomPicbookStore>()(
  persist(
    (set, get) => ({
      books: [],
      hydratedFromCloud: false,

      addBook: (draft) => {
        const now = new Date().toISOString()
        const id = draft.id.trim() || slugId(draft.title)
        const book: CustomPicbookRecord = {
          ...draft,
          id,
          productKey: normalizeProductKey(draft.productKey || `PICBOOK-${id.toUpperCase().slice(0, 12)}`),
          productKeyDisplay: draft.productKeyDisplay || draft.productKey,
          coverImage: draft.coverImage || `${base}visual-dictionary/nouns/n_rabbit_01.png`,
          magazineTone: draft.magazineTone || 'from-violet-600 via-fuchsia-500 to-pink-600',
          contentVersion: '1',
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ books: [...s.books.filter((b) => b.id !== id), book] }))
        return book
      },

      updateBook: (id, patch) =>
        set((s) => ({
          books: s.books.map((b) =>
            b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b,
          ),
        })),

      removeBook: (id) => set((s) => ({ books: s.books.filter((b) => b.id !== id) })),

      bumpVersion: (id) =>
        set((s) => ({
          books: s.books.map((b) => {
            if (b.id !== id) return b
            const n = String(Number(b.contentVersion) + 1 || 2)
            return { ...b, contentVersion: n, updatedAt: new Date().toISOString() }
          }),
        })),

      syncFromCloud: async () => {
        const remote = await fetchAllCustomPicbooks()
        if (remote.length === 0) {
          set({ hydratedFromCloud: true })
          return
        }
        set((s) => {
          const map = new Map<string, CustomPicbookRecord>()
          for (const b of s.books) map.set(b.id, b)
          for (const r of remote) {
            // 배포 뒤에 이 기기에서 더 고친 책은 덮어쓰지 않는다
            const local = map.get(r.id)
            if (!local || local.updatedAt <= r.updatedAt) map.set(r.id, r)
          }
          return { books: [...map.values()], hydratedFromCloud: true }
        })
      },

      publishBook: async (id) => {
        const book = get().books.find((b) => b.id === id)
        if (!book) return false
        return publishCustomPicbook(book)
      },
    }),
    { name: 'picbook.custom-books.v1', storage: createJSONStorage(() => safeLocalStorage) },
  ),
)
