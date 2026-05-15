import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LIBRARY_BOOKS } from '../data/libraryBooks'
import { parsePackJson } from '../lib/parsePack'
import { usePlaySessionStore } from '../state/playSessionStore'
import { useUserProfileStore } from '../state/userProfileStore'

export default function BookshelfPage() {
  const navigate = useNavigate()
  const profile = useUserProfileStore((s) => s.profile)
  const setSession = usePlaySessionStore((s) => s.setSession)
  const fileRef = useRef<HTMLInputElement>(null)

  const openBook = (bookId: string) => {
    const book = LIBRARY_BOOKS.find((b) => b.id === bookId)
    if (!book) return
    setSession(book.id, book.loadPack())
    navigate(`/play/${book.id}`)
  }

  const onImportFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const parsed = parsePackJson(text)
      if (!parsed.ok) {
        window.alert(parsed.error)
        return
      }
      const id = `import-${parsed.pack.id}`
      setSession(id, parsed.pack)
      navigate(`/play/${id}`)
    }
    reader.readAsText(file, 'utf-8')
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 text-amber-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,200,120,0.12),_transparent_55%)]" />

      <header className="relative border-b border-amber-800/50 px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/90">PicBook 책장</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              {profile?.name ? `${profile.name}님, 어떤 책을 읽을까요?` : '책을 골라 주세요'}
            </h1>
          </div>
          <Link
            to="/editor"
            className="rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-200/90 hover:bg-amber-900/50"
          >
            만들기 (편집)
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-8">
        {/* 책장 선반 */}
        <div
          className="rounded-lg border border-amber-800/40 bg-gradient-to-b from-amber-950/80 to-amber-950/30 p-4 shadow-inner sm:p-6"
          style={{ boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.35)' }}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LIBRARY_BOOKS.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => openBook(book.id)}
                className="group flex text-left transition hover:-translate-y-1 hover:drop-shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {/* 책등 */}
                <div
                  className={`w-3 shrink-0 rounded-l-sm bg-gradient-to-b ${book.spine} shadow-[inset_-2px_0_4px_rgba(0,0,0,0.3)]`}
                />
                {/* 표지 */}
                <div
                  className={`flex min-h-[7.5rem] flex-1 flex-col justify-between rounded-r-md bg-gradient-to-br ${book.cover} p-4 shadow-lg ring-1 ring-black/20`}
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">PicBook</p>
                    <h2 className="mt-1 text-lg font-bold leading-tight text-white drop-shadow-sm">{book.title}</h2>
                  </div>
                  <p className="text-xs text-white/85">{book.subtitle}</p>
                </div>
              </button>
            ))}

            {/* 가져온 팩 */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group flex min-h-[7.5rem] items-center justify-center rounded-md border-2 border-dashed border-amber-600/50 bg-amber-950/30 p-4 text-center transition hover:border-amber-500 hover:bg-amber-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <div>
                <span className="text-2xl text-amber-500/80">+</span>
                <p className="mt-1 text-sm font-semibold text-amber-100">팩 파일 가져오기</p>
                <p className="mt-0.5 text-xs text-amber-400/80">JSON</p>
              </div>
            </button>
          </div>

          <div className="mt-4 h-2 rounded-full bg-gradient-to-b from-amber-800 to-amber-950 shadow-[0_4px_8px_rgba(0,0,0,0.4)]" aria-hidden />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => onImportFile(e.target.files?.[0] ?? null)}
        />
      </main>
    </div>
  )
}
