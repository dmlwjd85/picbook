import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SentenceTimeline } from '../types/timeline'
import { inboxPathForPublic } from '../lib/editorWorkspacePaths'

export type WorkspaceAssetEntry = {
  /** public/demo/... 대상 경로 */
  targetPath: string
  /** editor-inbox/{bookId}/... 에 넣을 파일명 */
  inboxFile: string
  /** 마지막 편집 시각 */
  updatedAt: string
  /** inbox 파일이 배포 스크립트로 반영됨 */
  synced?: boolean
  note?: string
}

/** Zustand 셀렉터에서 ?? [] 시 매번 새 배열 → 무한 리렌더 방지 */
export const EMPTY_WORKSPACE_ASSETS: WorkspaceAssetEntry[] = []

type EditorWorkspaceStore = {
  /** bookId → 대기 중인 public 파일 교체 */
  assetsByBook: Record<string, WorkspaceAssetEntry[]>
  registerAssetOverride: (bookId: string, targetPath: string, note?: string) => void
  markSynced: (bookId: string, targetPaths: string[]) => void
  getPending: (bookId: string) => WorkspaceAssetEntry[]
  clearBook: (bookId: string) => void
}

export const useEditorWorkspaceStore = create<EditorWorkspaceStore>()(
  persist(
    (set, get) => ({
      assetsByBook: {},

      registerAssetOverride: (bookId, targetPath, note) => {
        const normalized = targetPath.replace(/^\/+/, '').replace(/\\/g, '/')
        if (!normalized.startsWith('public/')) return
        const inboxFile = inboxPathForPublic(bookId, normalized).split('/').pop()!
        const entry: WorkspaceAssetEntry = {
          targetPath: normalized,
          inboxFile,
          updatedAt: new Date().toISOString(),
          synced: false,
          note,
        }
        set((s) => {
          const prev = s.assetsByBook[bookId] ?? []
          const next = [...prev.filter((e) => e.targetPath !== normalized), entry]
          return { assetsByBook: { ...s.assetsByBook, [bookId]: next } }
        })
      },

      markSynced: (bookId, targetPaths) => {
        const setPaths = new Set(targetPaths)
        set((s) => ({
          assetsByBook: {
            ...s.assetsByBook,
            [bookId]: (s.assetsByBook[bookId] ?? []).map((e) =>
              setPaths.has(e.targetPath) ? { ...e, synced: true } : e,
            ),
          },
        }))
      },

      getPending: (bookId) => (get().assetsByBook[bookId] ?? []).filter((e) => !e.synced),

      clearBook: (bookId) =>
        set((s) => {
          const next = { ...s.assetsByBook }
          delete next[bookId]
          return { assetsByBook: next }
        }),
    }),
    { name: 'picbook.editor.workspace.v1' },
  ),
)

export type EditorWorkspaceBundle = {
  exportedAt: string
  bookId: string
  bookTitle: string
  timelines: Record<string, SentenceTimeline>
  pendingAssets: WorkspaceAssetEntry[]
  inboxRoot: string
}

export function downloadEditorWorkspaceBundle(
  bookId: string,
  bookTitle: string,
  timelines: Record<string, SentenceTimeline>,
  pendingAssets: WorkspaceAssetEntry[],
): void {
  const bundle: EditorWorkspaceBundle = {
    exportedAt: new Date().toISOString(),
    bookId,
    bookTitle,
    timelines,
    pendingAssets,
    inboxRoot: `editor-inbox/${bookId}/`,
  }
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `picbook-workspace-${bookId}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
