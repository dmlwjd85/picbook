import { create } from 'zustand'
import type { ReadingPack } from '../types/pack'

type PlaySessionStore = {
  pack: ReadingPack | null
  bookId: string | null
  setSession: (bookId: string, pack: ReadingPack) => void
  clearSession: () => void
}

export const usePlaySessionStore = create<PlaySessionStore>((set) => ({
  pack: null,
  bookId: null,
  setSession: (bookId, pack) => set({ bookId, pack }),
  clearSession: () => set({ bookId: null, pack: null }),
}))
