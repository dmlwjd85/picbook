import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  accountToCloudPayload,
  fetchCloudAccount,
  isCloudSyncEnabled,
  mergeCloudIntoLocal,
  pushCloudAccount,
} from '../lib/accountCloudSync'
import { importCloudMasterData } from '../lib/importCloudMasterData'
import { isValidSixDigitPassword } from '../lib/password'
import { usePicbookSceneEditStore } from './picbookSceneEditStore'
import { usePicbookTimelineStore } from './picbookTimelineStore'

const STORAGE_KEY = 'picbook.accounts.v1'

export type UserAccount = {
  /** 표시용 이름(최초 등록 시 입력값) */
  name: string
  password: string
  unlockedIds: string[]
  createdAt: string
  lastLoginAt: string
}

export function accountKeyFromName(name: string): string {
  return name.trim().toLowerCase()
}

type UserAccountStore = {
  accounts: Record<string, UserAccount>
  /** 현재 로그인 세션(계정 키) */
  sessionKey: string | null
  getActiveAccount: () => UserAccount | null
  register: (name: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  login: (name: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
  isUnlocked: (bookId: string) => boolean
  unlock: (bookId: string) => void
  migrateLegacyStorage: () => void
  /** 계정·연출을 클라우드에 올림 */
  pushCloudSnapshot: () => Promise<void>
}

function touchLogin(accounts: Record<string, UserAccount>, key: string): Record<string, UserAccount> {
  const acc = accounts[key]
  if (!acc) return accounts
  return {
    ...accounts,
    [key]: { ...acc, lastLoginAt: new Date().toISOString() },
  }
}

export const useUserAccountStore = create<UserAccountStore>()(
  persist(
    (set, get) => ({
      accounts: {},
      sessionKey: null,

      getActiveAccount: () => {
        const key = get().sessionKey
        if (!key) return null
        return get().accounts[key] ?? null
      },

      register: async (name, password) => {
        const trimmed = name.trim()
        if (trimmed.length < 1) return { ok: false, error: '이름을 입력해 주세요.' }
        if (!isValidSixDigitPassword(password)) {
          return { ok: false, error: '비밀번호는 숫자 6자리로 입력해 주세요.' }
        }
        const key = accountKeyFromName(trimmed)
        if (get().accounts[key]) {
          return { ok: false, error: '이미 등록된 이름입니다. 로그인해 주세요.' }
        }
        const now = new Date().toISOString()
        const account: UserAccount = {
          name: trimmed,
          password,
          unlockedIds: [],
          createdAt: now,
          lastLoginAt: now,
        }
        set((s) => ({
          accounts: { ...s.accounts, [key]: account },
          sessionKey: key,
        }))
        await get().pushCloudSnapshot()
        return { ok: true }
      },

      login: async (name, password) => {
        const trimmed = name.trim()
        if (trimmed.length < 1) return { ok: false, error: '이름을 입력해 주세요.' }
        if (!isValidSixDigitPassword(password)) {
          return { ok: false, error: '비밀번호는 숫자 6자리로 입력해 주세요.' }
        }
        const key = accountKeyFromName(trimmed)
        let account = get().accounts[key]

        if (!account && isCloudSyncEnabled()) {
          const cloudOnly = await fetchCloudAccount(trimmed, password)
          if (cloudOnly) {
            const now = new Date().toISOString()
            account = {
              name: cloudOnly.name,
              password,
              unlockedIds: cloudOnly.unlockedIds,
              createdAt: now,
              lastLoginAt: now,
            }
            set((s) => ({ accounts: { ...s.accounts, [key]: account! } }))
            importCloudMasterData(cloudOnly)
          }
        }

        if (!account) {
          return { ok: false, error: '등록되지 않은 이름입니다. 처음이시면 가입해 주세요.' }
        }
        if (account.password !== password) {
          return { ok: false, error: '비밀번호가 맞지 않습니다.' }
        }

        if (isCloudSyncEnabled()) {
          const cloud = await fetchCloudAccount(trimmed, password)
          if (cloud) {
            importCloudMasterData(cloud)
            account = mergeCloudIntoLocal(account, cloud)
            set((s) => ({
              accounts: { ...s.accounts, [key]: account! },
            }))
          }
        }

        set((s) => ({
          sessionKey: key,
          accounts: touchLogin(s.accounts, key),
        }))
        await get().pushCloudSnapshot()
        return { ok: true }
      },

      /** 세션만 종료 — accounts·unlockedIds는 localStorage에 유지 */
      logout: () => set({ sessionKey: null }),

      isUnlocked: (bookId) => {
        const acc = get().getActiveAccount()
        return acc?.unlockedIds.includes(bookId) ?? false
      },

      unlock: (bookId) => {
        const key = get().sessionKey
        if (!key) return
        set((s) => {
          const acc = s.accounts[key]
          if (!acc || acc.unlockedIds.includes(bookId)) return s
          return {
            accounts: {
              ...s.accounts,
              [key]: { ...acc, unlockedIds: [...acc.unlockedIds, bookId] },
            },
          }
        })
        void get().pushCloudSnapshot()
      },

      pushCloudSnapshot: async () => {
        if (!isCloudSyncEnabled()) return
        const acc = get().getActiveAccount()
        if (!acc) return
        const timelines = usePicbookTimelineStore.getState().byBook
        const sceneEditsByBook = usePicbookSceneEditStore.getState().editsByBook
        await pushCloudAccount(accountToCloudPayload(acc, timelines, sceneEditsByBook))
      },

      migrateLegacyStorage: () => {
        if (typeof localStorage === 'undefined') return
        try {
          const legacyProfileRaw = localStorage.getItem('picbook.user.profile.v1')
          const legacyUnlockRaw = localStorage.getItem('picbook.library.unlocks.v1')
          type LegacyProfilePayload = {
            state?: { profile?: { name: string; password: string; createdAt: string } }
          }
          let legacyProfile: LegacyProfilePayload | null = null
          let legacyUnlocks: string[] = []
          if (legacyProfileRaw) {
            legacyProfile = JSON.parse(legacyProfileRaw) as LegacyProfilePayload
          }
          if (legacyUnlockRaw) {
            const parsed = JSON.parse(legacyUnlockRaw) as { state?: { unlockedIds?: string[] } }
            legacyUnlocks = parsed?.state?.unlockedIds ?? []
          }
          const p = legacyProfile?.state?.profile
          if (!p?.name) return

          const key = accountKeyFromName(p.name)
          set((s) => {
            if (s.accounts[key]) {
              if (!s.sessionKey) return { sessionKey: key }
              return s
            }
            const now = new Date().toISOString()
            return {
              accounts: {
                ...s.accounts,
                [key]: {
                  name: p.name.trim(),
                  password: p.password,
                  unlockedIds: legacyUnlocks,
                  createdAt: p.createdAt ?? now,
                  lastLoginAt: now,
                },
              },
              sessionKey: s.sessionKey ?? key,
            }
          })
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ accounts: s.accounts, sessionKey: s.sessionKey }),
      onRehydrateStorage: () => (state) => {
        state?.migrateLegacyStorage()
      },
    },
  ),
)

/** 이전 스토어와 호환 — 프로필 형태 */
export function useActiveProfile() {
  return useUserAccountStore((s) => {
    const acc = s.getActiveAccount()
    if (!acc) return null
    return { name: acc.name, password: acc.password, createdAt: acc.createdAt }
  })
}
