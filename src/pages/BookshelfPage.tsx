import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MagazineShelf } from '../components/bookshelf/MagazineShelf'
import { PicbookStore } from '../components/bookshelf/PicbookStore'
import { UserLogoutButton } from '../components/UserLogoutButton'
import { useLibraryUnlockStore } from '../state/libraryUnlockStore'
import { useUserAccountStore } from '../state/userAccountStore'

type Tab = 'shelf' | 'store'

export default function BookshelfPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const profileName = useUserAccountStore((s) => s.getActiveAccount()?.name)
  const isUnlocked = useLibraryUnlockStore((s) => s.isUnlocked)

  const tabParam = searchParams.get('tab')
  const [tab, setTab] = useState<Tab>(tabParam === 'store' ? 'store' : 'shelf')

  useEffect(() => {
    if (tabParam === 'store') setTab('store')
    else if (tabParam === 'shelf') setTab('shelf')
  }, [tabParam])

  const switchTab = (next: Tab) => {
    setTab(next)
    setSearchParams(next === 'store' ? { tab: 'store' } : {}, { replace: true })
  }

  const openBook = (bookId: string) => {
    if (!isUnlocked(bookId)) {
      switchTab('store')
      return
    }
    navigate(`/play/${bookId}`)
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-amber-950 via-stone-950 to-stone-950 text-amber-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,200,120,0.1),_transparent_50%)]" />

      <header className="relative border-b border-amber-900/60 px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/90">PicBook</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              {profileName ? `${profileName}님의 책장` : '책장'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UserLogoutButton className="rounded-lg border border-amber-800/60 bg-amber-950/50 px-3 py-1.5 text-xs font-medium text-amber-200/90 hover:bg-amber-900/60" />
            <Link
              to="/master/login"
              className="rounded-lg border border-amber-800/60 bg-amber-950/50 px-3 py-1.5 text-xs font-medium text-amber-200/90 hover:bg-amber-900/50"
            >
              마스터 로그인
            </Link>
          </div>
        </div>

        {/* 탭 */}
        <div className="mx-auto mt-5 flex max-w-5xl gap-1 rounded-xl bg-amber-950/60 p-1 ring-1 ring-amber-800/40">
          <button
            type="button"
            onClick={() => switchTab('shelf')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              tab === 'shelf'
                ? 'bg-amber-800 text-amber-50 shadow'
                : 'text-amber-300/80 hover:bg-amber-900/40'
            }`}
          >
            내 서재
          </button>
          <button
            type="button"
            onClick={() => switchTab('store')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              tab === 'store'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-amber-300/80 hover:bg-amber-900/40'
            }`}
          >
            픽북 구매하기
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {tab === 'shelf' ? (
          <MagazineShelf onOpenBook={openBook} onGoStore={() => switchTab('store')} />
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6">
            <PicbookStore onUnlocked={() => switchTab('shelf')} />
          </div>
        )}
      </main>
    </div>
  )
}
