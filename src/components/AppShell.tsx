import { Link, NavLink, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="h-full w-full bg-slate-100 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="font-semibold text-slate-900 truncate">
              PicBook
            </Link>
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-1.5 transition',
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                에디터
              </NavLink>
              <NavLink
                to="/draft/pages"
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-1.5 transition',
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                문장 페이지
              </NavLink>
              <NavLink
                to="/library"
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-1.5 transition',
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                책장
              </NavLink>
            </nav>
          </div>

          <div className="text-xs text-slate-500 whitespace-nowrap">
            MVP: 로컬 저장소 기반(추후 계정/결제 서버 연동)
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
    </div>
  )
}
