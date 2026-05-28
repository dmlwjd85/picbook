import { useMemo, useState, type FormEvent } from 'react'
import { getEditableCatalogItems, findCatalogByProductKey } from '../../data/picbookCatalog'
import { useCustomPicbookStore } from '../../state/customPicbookStore'
import { normalizeProductKey } from '../../lib/productKey'
import { useLibraryUnlockStore } from '../../state/libraryUnlockStore'
import type { PicbookCatalogItem } from '../../data/picbookCatalog'

type Props = {
  onUnlocked?: (bookId: string) => void
}

function StoreCard({
  book,
  owned,
  onUnlock,
  onFreeClaim,
}: {
  book: PicbookCatalogItem
  owned: boolean
  onUnlock: (key: string) => string | null
  onFreeClaim: (bookId: string) => string | null
}) {
  const [keyInput, setKeyInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (book.comingSoon) return
    const err = onUnlock(keyInput)
    if (err) {
      setError(err)
      return
    }
    setSuccess(true)
    setKeyInput('')
  }

  const onClaimFree = () => {
    setError(null)
    const err = onFreeClaim(book.id)
    if (err) {
      setError(err)
      return
    }
    setSuccess(true)
  }

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-slate-900/80 shadow-xl backdrop-blur-sm ${
        owned ? 'border-emerald-600/40' : 'border-slate-700/80'
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
        <img src={book.coverImage} alt="" className="h-full w-full object-cover object-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        {book.comingSoon ? (
          <span className="absolute left-3 top-3 rounded-md bg-slate-800/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            출판 예정
          </span>
        ) : owned ? (
          <span className="absolute left-3 top-3 rounded-md bg-emerald-800/90 px-2 py-1 text-[10px] font-bold text-emerald-100">
            보유 중
          </span>
        ) : book.free ? (
          <span className="absolute left-3 top-3 rounded-md bg-sky-800/90 px-2 py-1 text-[10px] font-bold text-sky-100">
            무료
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-amber-200">
            🔒 잠금
          </span>
        )}
        <p className="absolute bottom-3 right-3 text-sm font-bold text-white">{book.listPrice}</p>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-300/90">PicBook</p>
        <h3 className="mt-1 text-lg font-bold text-white">{book.title}</h3>
        <p className="text-xs text-slate-400">{book.subtitle}</p>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">{book.blurb}</p>
        <p className="mt-2 text-[11px] text-slate-500">{book.author}</p>

        {book.comingSoon ? (
          <p className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-center text-xs text-slate-400">
            곧 출판됩니다. 제품키는 출간 후 안내됩니다.
          </p>
        ) : owned ? (
          <p className="mt-4 rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-3 py-2.5 text-center text-xs font-medium text-emerald-200">
            내 서재에 진열되어 있어요
          </p>
        ) : book.free ? (
          <div className="mt-4 space-y-2">
            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}
            {success ? (
              <p className="text-xs font-medium text-emerald-400">내 서재에 추가되었습니다.</p>
            ) : (
              <button
                type="button"
                onClick={onClaimFree}
                className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-bold text-white hover:bg-sky-500"
              >
                무료로 받기
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-2">
            <label className="block text-[11px] font-medium text-slate-400">
              제품키
              <input
                type="text"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value)
                  setError(null)
                  setSuccess(false)
                }}
                placeholder="예: PICBOOK-3POWERS-2026"
                autoComplete="off"
                spellCheck={false}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2.5 font-mono text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>
            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}
            {success ? <p className="text-xs font-medium text-emerald-400">잠금 해제되었습니다. 내 서재를 확인하세요.</p> : null}
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
            >
              등록 · 잠금 해제
            </button>
          </form>
        )}
      </div>
    </article>
  )
}

/** 전자서점 — 출판·예정 PicBook 진열 및 제품키 등록 */
export function PicbookStore({ onUnlocked }: Props) {
  const customBooks = useCustomPicbookStore((s) => s.books)
  const catalog = useMemo(() => getEditableCatalogItems(), [customBooks])
  const unlock = useLibraryUnlockStore((s) => s.unlock)
  const isUnlocked = useLibraryUnlockStore((s) => s.isUnlocked)

  const handleUnlock = (rawKey: string): string | null => {
    const normalized = normalizeProductKey(rawKey)
    if (!normalized) return '제품키를 입력해 주세요.'

    const match = findCatalogByProductKey(rawKey)
    if (!match) return '올바르지 않은 제품키입니다. 대·소문자와 하이픈은 자유롭게 입력할 수 있어요.'

    if (isUnlocked(match.id)) return '이미 등록된 PicBook입니다.'

    unlock(match.id)
    onUnlocked?.(match.id)
    return null
  }

  const handleFreeClaim = (bookId: string): string | null => {
    const book = catalog.find((b) => b.id === bookId)
    if (!book?.free) return '무료로 받을 수 없는 PicBook입니다.'
    if (isUnlocked(bookId)) return '이미 등록된 PicBook입니다.'
    unlock(bookId)
    onUnlocked?.(bookId)
    return null
  }

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">픽북 구매하기</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          출판 PicBook을 고르고 제품키를 입력하면 개인 서재에 매거진으로 추가됩니다
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {catalog.map((book) => (
          <StoreCard
            key={book.id}
            book={book}
            owned={isUnlocked(book.id)}
            onUnlock={handleUnlock}
            onFreeClaim={handleFreeClaim}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-500">
        제품키는 구매·배포 시 안내된 코드입니다. 출판 예정 작품은 키가 활성화되면 등록할 수 있습니다.
      </p>
    </section>
  )
}
