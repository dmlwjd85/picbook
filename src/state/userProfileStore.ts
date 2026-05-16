/**
 * @deprecated useUserAccountStore / useActiveProfile 사용
 */
import { useActiveProfile, useUserAccountStore } from './userAccountStore'

export { isValidSixDigitPassword } from '../lib/password'

export type UserProfile = {
  name: string
  password: string
  createdAt: string
}

export const useUserProfileStore = <T,>(
  selector: (s: {
    profile: UserProfile | null
    setProfile: (name: string, password: string) => void
    clearProfile: () => void
    verifyPassword: (password: string) => boolean
  }) => T,
): T => {
  return useUserAccountStore((s) => {
    const acc = s.getActiveAccount()
    const profile = acc
      ? { name: acc.name, password: acc.password, createdAt: acc.createdAt }
      : null
    const stub = {
      profile,
      setProfile: (name: string, password: string) => {
        const key = name.trim().toLowerCase()
        if (s.accounts[key]) {
          s.login(name, password)
        } else {
          s.register(name, password)
        }
      },
      clearProfile: () => s.logout(),
      verifyPassword: (password: string) => acc?.password === password,
    }
    return selector(stub)
  })
}

export { useActiveProfile }
