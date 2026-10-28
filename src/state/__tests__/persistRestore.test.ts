// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

/** 기존(버전 표기 없음 = 0) 형태 그대로 저장된 데이터가 손실 없이 복원되는지 확인 */
type Case = {
  key: string
  load: () => Promise<{ getState: () => Record<string, unknown> }>
  state: Record<string, unknown>
}

const cases: Case[] = [
  {
    key: 'picbook.accounts.v2',
    load: async () => (await import('../userAccountStore')).useUserAccountStore,
    state: {
      accounts: {
        'uid-kim': {
          uid: 'uid-kim',
          loginId: 'kim',
          name: '김학생',
          unlockedIds: ['elementary-proverbs'],
          createdAt: '2026-01-01T00:00:00.000Z',
          lastLoginAt: '2026-01-02T00:00:00.000Z',
          localPasswordHash: 'abc123',
        },
      },
      sessionKey: 'uid-kim',
    },
  },
  {
    key: 'picbook.master.password.v1',
    load: async () => (await import('../masterAuthStore')).useMasterAuthStore,
    state: { masterPassword: 'sample' },
  },
  {
    key: 'picbook.editor.pack.v1',
    load: async () => (await import('../packEditorStore')).usePackEditorStore,
    state: { pack: { id: 'p1', title: '테스트 팩', sentences: [{ id: 's1', text: '안녕' }], extra: { keep: true } }, activeSentenceIndex: 3 },
  },
  {
    key: 'picbook.editor.workspace.v1',
    load: async () => (await import('../editorWorkspaceStore')).useEditorWorkspaceStore,
    state: { byBook: { b1: { assets: [{ targetPath: 'demo/a.png', inboxFile: 'a.png', updatedAt: '2026-01-01' }] } }, unknownField: 42 },
  },
  {
    key: 'picbook.master.timeline.v2',
    load: async () => (await import('../picbookTimelineStore')).usePicbookTimelineStore,
    state: { byBook: { b1: { s1: { version: 2, frameEdits: { f1: { x: 1 } }, inserts: [] } } } },
  },
  {
    key: 'picbook.master.scene-edits.v1',
    load: async () => (await import('../picbookSceneEditStore')).usePicbookSceneEditStore,
    state: { editsByBook: { b1: { s1: { zoom: 1.2 } } } },
  },
  {
    key: 'picbook.custom-books.v1',
    load: async () => (await import('../customPicbookStore')).useCustomPicbookStore,
    state: { books: [{ id: 'c1', title: '나만의 책', contentVersion: '3' }], hydratedFromCloud: false },
  },
  {
    key: 'picbook.pack-sentence-overrides.v1',
    load: async () => (await import('../packSentenceOverrideStore')).usePackSentenceOverrideStore,
    state: { byBook: { b1: { 0: '고친 문장', 5: '또 다른 문장' } } },
  },
  {
    key: 'picbook.book-edits.v1',
    load: async () => (await import('../bookEditStore')).useBookEditStore,
    state: {
      byBook: {
        b1: {
          panels: { 0: { id: 's1', text: '고친 문장', images: ['a.webp', 'b.webp'], cueIndexes: [0, 2] } },
          texts: { 1: '문장만 고침' },
          reviewed: ['0'],
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
      dirtyBookIds: ['b1'],
    },
  },
  {
    key: 'picbook.typing-records.v1',
    load: async () => (await import('../typingRecordStore')).useTypingRecordStore,
    state: {
      byUser: {
        'uid-kim': [
          {
            bookId: 'b1',
            bookTitle: '테스트 책',
            sentence: '안녕',
            cpm: 120,
            accuracy: 98,
            chars: 10,
            at: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  },
]

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.resetModules()
})

describe('persist 스토어 v1 마이그레이션: 기존 저장 데이터 그대로 복원', () => {
  for (const c of cases) {
    for (const storedVersion of [0, 1]) {
      it(`${c.key} (저장 버전 ${storedVersion})`, async () => {
        localStorage.setItem(c.key, JSON.stringify({ state: c.state, version: storedVersion }))
        const store = await c.load()
        await new Promise((r) => setTimeout(r, 0))
        const s = store.getState()
        for (const [k, v] of Object.entries(c.state)) {
          expect(s[k]).toEqual(v)
        }
        // 키 이름 유지, 버전 1로 기록
        const raw = JSON.parse(localStorage.getItem(c.key) ?? 'null')
        if (raw) expect(raw.version).toBeLessThanOrEqual(1)
      })
    }
  }
})
