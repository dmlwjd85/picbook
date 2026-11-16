import { useMemo } from 'react'
import { getEditableCatalogItems, type PicbookCatalogItem } from '../data/picbookCatalog'
import { PASS_ALL } from '../data/passProducts'
import { useCustomPicbookStore } from '../state/customPicbookStore'
import { useMasterAuthStore } from '../state/masterAuthStore'
import { useUserAccountStore } from '../state/userAccountStore'

export type AccessContext = {
  loggedIn: boolean
  /** 보유한 이용권(분류 id 또는 'all') */
  passes: string[]
  /** 관리자·마스터 — 모든 책 미리보기 */
  staff: boolean
}

/**
 * 책 전체를 열 수 있는지.
 * - 관리자·마스터: 모두
 * - 무료 책: 가입한 회원이면 누구나
 * - 그 밖: 책의 분류 이용권(또는 전체 이용권)이 있을 때
 * 열 수 없으면 앞부분 몇 문장만 체험으로 보여 준다.
 */
export function canOpenBook(book: Pick<PicbookCatalogItem, 'category' | 'free'>, ctx: AccessContext): boolean {
  if (ctx.staff) return true
  if (!ctx.loggedIn) return false
  if (book.free) return true
  return ctx.passes.includes(book.category) || ctx.passes.includes(PASS_ALL)
}

export function useAccessContext(): AccessContext {
  const loggedIn = useUserAccountStore((s) => Boolean(s.sessionKey))
  const passes = useUserAccountStore((s) => s.passes)
  const isAdmin = useUserAccountStore((s) => s.isAdmin)
  const master = useMasterAuthStore((s) => s.isLoggedIn)
  return useMemo(() => ({ loggedIn, passes, staff: isAdmin || master }), [loggedIn, passes, isAdmin, master])
}

/** 관리자·마스터로 모든 책을 미리 보는 중인지 */
export function useStaffPreview(): boolean {
  return useAccessContext().staff
}

/** 내 보관함 — 지금 전체를 열 수 있는 책 */
export function useShelfBooks(): PicbookCatalogItem[] {
  const ctx = useAccessContext()
  const customBooks = useCustomPicbookStore((s) => s.books)
  return useMemo(
    () => getEditableCatalogItems().filter((b) => canOpenBook(b, ctx)),
    // customBooks: 관리자가 책을 추가·수정하면 다시 계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx, customBooks],
  )
}
