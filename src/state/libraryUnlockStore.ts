import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const STORAGE_KEY = 'picbook.library.unlocks.v1'

type LibraryUnlockStore = {
  unlockedIds: string[]
  isUnlocked: (bookId: string) => boolean
  unlock: (bookId: string) => void
}

export const useLibraryUnlockStore = create<LibraryUnlockStore>()(
  persist(
    (set, get) => ({
      unlockedIds: [],
      isUnlocked: (bookId) => get().unlockedIds.includes(bookId),
      unlock: (bookId) =>
        set((s) =>
          s.unlockedIds.includes(bookId) ? s : { unlockedIds: [...s.unlockedIds, bookId] },
        ),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ unlockedIds: s.unlockedIds }),
    },
  ),
)
