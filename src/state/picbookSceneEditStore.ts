import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { panelKeyFromImageUrl } from '../lib/panelKey'
import { defaultPanelSceneEdit, type PanelSceneEdit } from '../types/sceneEdit'

const STORAGE_KEY = 'picbook.master.scene-edits.v1'

type SceneEditStore = {
  /** bookId → panelKey → 연출 */
  editsByBook: Record<string, Record<string, PanelSceneEdit>>
  getPanelEdit: (bookId: string, imageUrl: string) => PanelSceneEdit
  setPanelEdit: (bookId: string, imageUrl: string, patch: Partial<PanelSceneEdit>) => void
  clearBookEdits: (bookId: string) => void
}

export const usePicbookSceneEditStore = create<SceneEditStore>()(
  persist(
    (set, get) => ({
      editsByBook: {},

      getPanelEdit: (bookId, imageUrl) => {
        const key = panelKeyFromImageUrl(imageUrl)
        return get().editsByBook[bookId]?.[key] ?? defaultPanelSceneEdit()
      },

      setPanelEdit: (bookId, imageUrl, patch) =>
        set((s) => {
          const panelKey = panelKeyFromImageUrl(imageUrl)
          const book = { ...(s.editsByBook[bookId] ?? {}) }
          const prev = book[panelKey] ?? defaultPanelSceneEdit()
          book[panelKey] = { ...prev, ...patch }
          if (patch.textOverlay !== undefined) {
            const t = patch.textOverlay.text.trim()
            if (!t) {
              const { textOverlay: _removed, ...rest } = book[panelKey]
              book[panelKey] = rest as PanelSceneEdit
            } else {
              book[panelKey] = {
                ...book[panelKey],
                textOverlay: {
                  text: t,
                  position: patch.textOverlay.position ?? prev.textOverlay?.position ?? 'top',
                },
              }
            }
          }
          return { editsByBook: { ...s.editsByBook, [bookId]: book } }
        }),

      clearBookEdits: (bookId) =>
        set((s) => {
          const next = { ...s.editsByBook }
          delete next[bookId]
          return { editsByBook: next }
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ editsByBook: s.editsByBook }),
    },
  ),
)
