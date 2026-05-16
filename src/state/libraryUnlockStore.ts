/**
 * @deprecated useUserAccountStore 사용 — 계정별 구매 이력
 * 하위 호환용 래퍼
 */
import { useUserAccountStore } from './userAccountStore'

export const useLibraryUnlockStore = <T,>(
  selector: (s: {
    unlockedIds: string[]
    isUnlocked: (bookId: string) => boolean
    unlock: (bookId: string) => void
  }) => T,
): T => {
  return useUserAccountStore((s) => {
    const acc = s.getActiveAccount()
    const stub = {
      unlockedIds: acc?.unlockedIds ?? [],
      isUnlocked: s.isUnlocked,
      unlock: s.unlock,
    }
    return selector(stub)
  })
}
