import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const PASSWORD_KEY = 'picbook.master.password.v1'
const SESSION_KEY = 'picbook.master.session'

function readSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writeSession(on: boolean): void {
  try {
    if (on) sessionStorage.setItem(SESSION_KEY, '1')
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

type MasterAuthStore = {
  /** 최초 1회 설정하는 마스터 비밀번호(6자리, localStorage) */
  masterPassword: string | null
  /** 이번 탭에서 로그인 여부(sessionStorage) */
  isLoggedIn: boolean
  hydrateSession: () => void
  setMasterPassword: (password: string) => void
  login: (password: string) => boolean
  logout: () => void
  hasMasterPassword: () => boolean
}

export const useMasterAuthStore = create<MasterAuthStore>()(
  persist(
    (set, get) => ({
      masterPassword: null,
      isLoggedIn: readSession(),
      hydrateSession: () => set({ isLoggedIn: readSession() }),
      setMasterPassword: (password) => {
        set({ masterPassword: password })
        writeSession(true)
        set({ isLoggedIn: true })
      },
      login: (password) => {
        if (get().masterPassword !== password) return false
        writeSession(true)
        set({ isLoggedIn: true })
        return true
      },
      logout: () => {
        writeSession(false)
        set({ isLoggedIn: false })
      },
      hasMasterPassword: () => Boolean(get().masterPassword),
    }),
    {
      name: PASSWORD_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ masterPassword: s.masterPassword }),
    },
  ),
)
