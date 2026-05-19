import { PICBOOK_CATALOG } from '../data/picbookCatalog'
import { useMasterAuthStore } from '../state/masterAuthStore'
import { useUserAccountStore } from '../state/userAccountStore'

/** 일반 구매 또는 마스터 미리보기 시 책 열기 가능 */
export function useCanOpenBook(bookId: string | undefined): boolean {
  const masterPreview = useMasterAuthStore((s) => s.isLoggedIn)
  const unlocked = useUserAccountStore((s) =>
    bookId ? (s.getActiveAccount()?.unlockedIds.includes(bookId) ?? false) : false,
  )
  return Boolean(bookId && (unlocked || masterPreview))
}

export function useMasterPreviewMode(): boolean {
  return useMasterAuthStore((s) => s.isLoggedIn)
}

/** 훅 없이 책 열기 가능 여부 */
export function canOpenBook(
  bookId: string,
  unlockedIds: string[],
  masterPreview: boolean,
): boolean {
  return unlockedIds.includes(bookId) || masterPreview
}

/** 마스터 미리보기 시 서재에 모든 출간 팩 표시 */
export function useShelfBookIds(): string[] {
  const masterPreview = useMasterAuthStore((s) => s.isLoggedIn)
  const unlocked = useUserAccountStore((s) => s.getActiveAccount()?.unlockedIds ?? [])
  if (masterPreview) {
    return PICBOOK_CATALOG.filter((b) => !b.comingSoon).map((b) => b.id)
  }
  return unlocked
}
