import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OverlayTypingPanel } from '../components/OverlayTypingPanel'
import { TypingPanel } from '../components/TypingPanel'
import { UserLogoutButton } from '../components/UserLogoutButton'
import { VisualStage } from '../components/VisualStage'
import { getLibraryBook } from '../data/libraryBooks'
import { useKeyboardInset } from '../hooks/useKeyboardInset'
import { computeLayerSnapshot } from '../lib/cueEngine'
import { usePlaySessionStore } from '../state/playSessionStore'
import { useUserProfileStore } from '../state/userProfileStore'
import type { ReadingPack } from '../types/pack'

function PlayActions({
  complete,
  lastSentence,
  progressPct,
  onNext,
}: {
  complete: boolean
  lastSentence: boolean
  progressPct: number
  onNext: () => void
}) {
  return (
    <>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-amber-700 transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
        {complete ? (
          <button
            type="button"
            className="rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-900 disabled:opacity-40"
            disabled={lastSentence}
            onClick={onNext}
          >
            {lastSentence ? '마지막 문장입니다' : '다음 문장 →'}
          </button>
        ) : (
          <p className="text-xs text-stone-500">문장을 끝까지 맞게 입력하면 다음으로 갈 수 있어요.</p>
        )}
        {lastSentence && complete ? (
          <Link
            to="/bookshelf"
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            책장으로
          </Link>
        ) : null}
      </div>
    </>
  )
}

export default function PlayPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const profile = useUserProfileStore((s) => s.profile)
  const sessionPack = usePlaySessionStore((s) => s.pack)
  const sessionBookId = usePlaySessionStore((s) => s.bookId)
  const setSession = usePlaySessionStore((s) => s.setSession)
  const keyboardInset = useKeyboardInset()

  const [pack, setPack] = useState<ReadingPack | null>(null)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    document.documentElement.classList.add('play-active')
    return () => document.documentElement.classList.remove('play-active')
  }, [])

  useEffect(() => {
    if (!bookId) {
      navigate('/bookshelf', { replace: true })
      return
    }
    if (sessionPack && sessionBookId === bookId) {
      setPack(sessionPack)
      return
    }
    const book = getLibraryBook(bookId)
    if (book) {
      const loaded = book.loadPack()
      setSession(book.id, loaded)
      setPack(loaded)
      return
    }
    navigate('/bookshelf', { replace: true })
  }, [bookId, sessionPack, sessionBookId, setSession, navigate])

  const sentence = pack?.sentences[sentenceIndex]

  useEffect(() => {
    setTyped('')
  }, [sentenceIndex, sentence?.id])

  const layers = useMemo(() => {
    if (!sentence) return []
    return computeLayerSnapshot(sentence, typed.length)
  }, [sentence, typed])

  const target = sentence?.text ?? ''
  const complete = target.length > 0 && typed === target
  const lastSentence = pack ? sentenceIndex >= pack.sentences.length - 1 : true
  const progressPct = target.length > 0 ? Math.round((typed.length / target.length) * 100) : 0

  if (!pack || !sentence) {
    return (
      <div className="flex min-h-full items-center justify-center bg-stone-100 text-stone-600">
        책을 불러오는 중…
      </div>
    )
  }

  return (
    <div className="play-shell flex h-[100dvh] flex-col overflow-hidden bg-stone-100 lg:min-h-full lg:h-auto lg:overflow-visible">
      <header className="z-20 shrink-0 border-b border-stone-200 bg-white px-3 py-2 shadow-sm sm:px-5 sm:py-2.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              to="/bookshelf"
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-50"
            >
              ← 책장
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-stone-900 sm:text-lg">{pack.title}</h1>
              <p className="text-[11px] text-stone-500 sm:text-xs">
                {profile?.name} · {sentenceIndex + 1}/{pack.sentences.length}
                <span className="ml-1.5 font-mono text-stone-600 lg:hidden">{progressPct}%</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <UserLogoutButton className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-600 hover:bg-white lg:hidden" />
            <div className="hidden text-right text-xs text-stone-500 lg:block">
              <span className="font-mono text-stone-700">{progressPct}%</span>
              <span className="ml-1">입력</span>
            </div>
            <UserLogoutButton className="hidden rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:bg-white lg:inline-flex" />
          </div>
        </div>
      </header>

      {/* 모바일: 연출 고정 */}
      <div
        className="relative z-10 shrink-0 border-b border-stone-300 bg-stone-900 lg:hidden"
        style={{ height: 'min(36dvh, 240px)' }}
      >
        <VisualStage layers={layers} embedded />
      </div>

      <main className="mx-auto flex w-full min-h-0 max-w-6xl flex-1 flex-col overflow-hidden lg:flex-1 lg:flex-row lg:gap-4 lg:overflow-visible lg:p-4">
        {/* 데스크톱 연출 */}
        <section className="hidden min-h-0 flex-1 flex-col lg:flex lg:min-w-0 lg:flex-[1.15]">
          <div className="mb-1.5 px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">연출</h2>
          </div>
          <div className="flex min-h-[min(50vh,420px)] flex-1 items-center rounded-2xl border border-stone-200 bg-stone-900/95 p-3 shadow-inner">
            <VisualStage layers={layers} />
          </div>
        </section>

        {/* 타이핑 — 모바일: 겹침 입력 / 데스크톱: 분리 */}
        <section
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain lg:w-[min(100%,380px)] lg:max-w-md lg:overflow-visible"
          style={{
            paddingBottom: keyboardInset > 0 ? `${keyboardInset + 8}px` : undefined,
          }}
        >
          {/* 모바일 */}
          <div className="flex flex-col p-3 lg:hidden">
            <OverlayTypingPanel target={target} typed={typed} onTypedChange={setTyped} />
            <PlayActions
              complete={complete}
              lastSentence={lastSentence}
              progressPct={progressPct}
              onNext={() => setSentenceIndex((i) => i + 1)}
            />
          </div>

          {/* 데스크톱 */}
          <div className="hidden flex-col lg:flex">
            <div className="mb-1.5 px-0.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">따라 쓰기</h2>
            </div>
            <div className="flex flex-1 flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="mb-3 rounded-xl bg-stone-50 px-3 py-2.5 text-lg leading-relaxed text-stone-800">
                {target}
              </p>
              <TypingPanel target={target} typed={typed} onTypedChange={setTyped} />
              <PlayActions
                complete={complete}
                lastSentence={lastSentence}
                progressPct={progressPct}
                onNext={() => setSentenceIndex((i) => i + 1)}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
