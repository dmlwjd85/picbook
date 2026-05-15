import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const STORAGE_KEY = 'picbook.user.profile.v1'

export type UserProfile = {
  name: string
  /** 6자리 숫자 비밀번호(로컬 저장) */
  password: string
  createdAt: string
}

type UserProfileStore = {
  profile: UserProfile | null
  setProfile: (name: string, password: string) => void
  clearProfile: () => void
  verifyPassword: (password: string) => boolean
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile: (name, password) =>
        set({
          profile: {
            name: name.trim(),
            password,
            createdAt: new Date().toISOString(),
          },
        }),
      clearProfile: () => set({ profile: null }),
      verifyPassword: (password) => get().profile?.password === password,
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ profile: s.profile }),
    },
  ),
)

export function isValidSixDigitPassword(value: string): boolean {
  return /^\d{6}$/.test(value)
}
