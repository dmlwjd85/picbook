import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { usePlaySessionStore } from '../../state/playSessionStore'
import { useUserAccountStore } from '../../state/userAccountStore'
import { useCanEdit } from '../RequireAdmin'

const MENU = [
  { to: '/', label: '홈', end: true },
  { to: '/bookshelf', label: '내 보관함' },
  { to: '/passes', label: '이용권' },
  { to: '/ranking', label: '랭킹' },
  { to: '/mypage', label: '내 기록' },
]

/** 모든 일반 화면 위에 놓이는 상단 메뉴 */
export function SiteHeader() {
  const navigate = useNavigate()
  const account = useUserAccountStore((s) => s.getActiveAccount())
  const logout = useUserAccountStore((s) => s.logout)
  const clearSession = usePlaySessionStore((s) => s.clearSession)
  const canEdit = useCanEdit()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-bold transition ${
      isActive ? 'bg-orange-50 text-orange-700' : 'text-stone-700 hover:bg-stone-100'
    }`

  const onLogout = () => {
    clearSession()
    void logout().then(() => navigate('/', { replace: true }))
  }

  const menu = (
    <>
      {MENU.map((m) => (
        <NavLink key={m.to} to={m.to} end={m.end} className={linkClass} onClick={() => setOpen(false)}>
          {m.label}
        </NavLink>
      ))}
      {canEdit ? (
        <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
          편집 · 검수
        </NavLink>
      ) : null}
    </>
  )

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="font-display text-2xl leading-none text-orange-600">
          PicBook
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="주 메뉴">
          {menu}
        </nav>
        <div className="flex items-center gap-2">
          {account ? (
            <>
              <span className="hidden text-sm font-semibold text-stone-700 sm:inline">{account.name}님</span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-bold text-stone-700 hover:bg-stone-100">
                로그인
              </Link>
              <Link to="/signup" className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-orange-700">
                회원가입
              </Link>
            </>
          )}
          <button
            type="button"
            className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm font-bold text-stone-700 md:hidden"
            aria-expanded={open}
            aria-label="메뉴 열기"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
        </div>
      </div>
      {open ? (
        <nav className="flex flex-col gap-1 border-t border-stone-200 px-4 py-2 md:hidden" aria-label="주 메뉴">
          {menu}
        </nav>
      ) : null}
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-stone-500">
        <p>
          <span className="font-display text-base text-orange-600">PicBook</span> · 따라 쓰면 그림책이 완성돼요
        </p>
        <p>학생용 타자 · 읽기 연습</p>
      </div>
    </footer>
  )
}

/** 일반 화면 공통 틀 */
export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-stone-50 text-stone-900">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
