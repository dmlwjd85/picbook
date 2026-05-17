import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OverlayTypingPanel } from '../components/OverlayTypingPanel'
import { TypingInline } from '../components/TypingInline'
import { TypingPanel } from '../components/TypingPanel'
import { UserLogoutButton } from '../components/UserLogoutButton'
import { SentenceNavBar } from '../components/SentenceNavBar'
import { VisualStage } from '../components/VisualStage'
import { useSwipeSentences } from '../hooks/useSwipeSentences'
import { getLibraryBook } from '../data/libraryBooks'
import { loadCatalogPack } from '../lib/loadCatalogPack'
import { useKeyboardInset } from '../hooks/useKeyboardInset'
import { computeLayerSnapshot } from '../lib/cueEngine'
import { getActiveVocabGlosses } from '../lib/getActiveVocabGlosses'
import { usePlaySessionStore } from '../state/playSessionStore'
import { useUserAccountStore } from '../state/userAccountStore'
import type { ReadingPack } from '../types/pack'

function PlayActions({
  complete,
  lastSentence,
  progressPct,
  onNext,
  minimal = false,
  epilogueShown = false,
  onShowEpilogue,
}: {
  complete: boolean
  lastSentence: boolean
  progressPct: number
  onNext: () => void
  minimal?: boolean
  epilogueShown?: boolean
  onShowEpilogue?: () => void
}) {
  return (
    <>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-amber-700 transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
        {complete ? (
          epilogueShown ? (
            <button
              type="button"
              className="rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-900 disabled:opacity-40"
              disabled={lastSentence}
              onClick={onNext}
            >
              {lastSentence ? (minimal ? '끝' : '마지막 속담') : minimal ? '다음 속담 →' : '다음 속담 →'}
            </button>
          ) : onShowEpilogue ? (
            <button
              type="button"
              className="rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-900"
              onClick={onShowEpilogue}
            >
              교훈 보기 →
            </button>
          ) : (
            <button
              type="button"
              className="rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-900 disabled:opacity-40"
              disabled={lastSentence}
              onClick={onNext}
            >
              {lastSentence ? (minimal ? '끝' : '마지막 문장입니다') : minimal ? '다음 →' : '다음 문장 →'}
            </button>
          )
        ) : minimal ? null : (
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
  const profileName = useUserAccountStore((s) => s.getActiveAccount()?.name)
  const isBookUnlocked = useUserAccountStore((s) =>
    Boolean(bookId && s.getActiveAccount()?.unlockedIds.includes(bookId)),
  )
  const setSession = usePlaySessionStore((s) => s.setSession)
  const keyboardInset = useKeyboardInset()

  const [pack, setPack] = useState<ReadingPack | null>(null)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [typingDraft, setTypingDraft] = useState('')
  const [epilogueShown, setEpilogueShown] = useState(false)
  const [focusToken, setFocusToken] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.documentElement.classList.add('play-active')
    return () => document.documentElement.classList.remove('play-active')
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!bookId) {
      navigate('/bookshelf', { replace: true })
      return
    }
    if (!isBookUnlocked) {
      navigate('/bookshelf?tab=store', { replace: true })
      return
    }
    const book = getLibraryBook(bookId)
    if (!book || book.comingSoon) {
      navigate('/bookshelf', { replace: true })
      return
    }

    setLoading(true)
    setLoadError(null)
    setPack(null)

    const load = () => {
      if (cancelled) return
      try {
        const loaded = loadCatalogPack(book)
        if (cancelled) return
        setSession(book.id, loaded)
        startTransition(() => {
          setPack(loaded)
          setSentenceIndex(0)
          setTyped('')
          setLoading(false)
        })
      } catch (e) {
        if (cancelled) return
        setLoadError(e instanceof Error ? e.message : '책을 불러오지 못했습니다.')
        setLoading(false)
      }
    }

    const tid = window.setTimeout(load, 0)
    return () => {
      cancelled = true
      window.clearTimeout(tid)
    }
  }, [bookId, isBookUnlocked, navigate, setSession])

  const safeSentenceIndex =
    pack && pack.sentences.length > 0
      ? Math.min(Math.max(0, sentenceIndex), pack.sentences.length - 1)
      : 0

  const sentence = pack?.sentences[safeSentenceIndex]

  useEffect(() => {
    setTyped('')
    setTypingDraft('')
    setEpilogueShown(false)
    setFocusToken((t) => t + 1)
  }, [safeSentenceIndex, sentence?.id])

  const layers = useMemo(() => {
    if (!sentence) return []
    return computeLayerSnapshot(sentence, typed.length)
  }, [sentence, typed])

  const target = sentence?.text ?? ''
  const complete = target.length > 0 && typed === target
  const lastSentence = pack ? safeSentenceIndex >= pack.sentences.length - 1 : true
  const progressPct = target.length > 0 ? Math.round((typed.length / target.length) * 100) : 0
  const sentenceCount = pack?.sentences.length ?? 0

  const goToSentence = useCallback(
    (index: number) => {
      if (sentenceCount === 0) return
      setSentenceIndex(Math.min(Math.max(0, index), sentenceCount - 1))
      setFocusToken((t) => t + 1)
    },
    [sentenceCount],
  )

  const goPrevSentence = useCallback(() => {
    setSentenceIndex((i) => Math.max(0, i - 1))
  }, [])

  const goNextSentence = useCallback(() => {
    setSentenceIndex((i) => Math.min(i + 1, Math.max(0, sentenceCount - 1)))
    setFocusToken((t) => t + 1)
  }, [sentenceCount])

  const swipeHandlers = useSwipeSentences({
    onPrev: goPrevSentence,
    onNext: goNextSentence,
  })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return
      if (!complete) return

      const stacked = pack?.typingStyle === 'stacked'
      if (stacked) {
        e.preventDefault()
        if (!epilogueShown) {
          setEpilogueShown(true)
          return
        }
        if (!lastSentence) goNextSentence()
        return
      }

      if (lastSentence) return
      e.preventDefault()
      goNextSentence()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [complete, lastSentence, goNextSentence, epilogueShown, pack?.typingStyle])

  if (loadError) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-stone-100 px-6 text-center">
        <p className="text-sm font-medium text-red-600">{loadError}</p>
        <Link to="/bookshelf" className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-bold text-white">
          책장으로
        </Link>
      </div>
    )
  }

  const minimalTyping = pack?.typingStyle === 'minimal'
  const isStacked = pack?.typingStyle === 'stacked'

  if (loading || !pack || !sentence) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-stone-100 text-stone-600">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-amber-700 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm">책을 불러오는 중…</p>
      </div>
    )
  }

  const closingCaption =
    isStacked && epilogueShown ? sentence.closingLine?.trim() || null : null
  const karaokeProps =
    isStacked && !epilogueShown
      ? { target, draft: typingDraft, committed: typed }
      : null

  const activeVocab =
    isStacked && sentence && !epilogueShown
      ? getActiveVocabGlosses(sentence, typed.length)
      : []

  return (
    <div
      className="play-shell flex h-[100dvh] flex-col overflow-hidden bg-stone-100 lg:min-h-full lg:h-auto lg:overflow-visible"
      {...swipeHandlers}
    >
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
                {profileName ?? '읽는 중'} · {safeSentenceIndex + 1}/{pack.sentences.length}
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

      <div className={`z-20 shrink-0 border-b border-stone-200 bg-stone-50 px-5 py-2 ${isStacked ? 'hidden' : 'hidden lg:block'}`}>
        <div className="mx-auto max-w-6xl">
          <SentenceNavBar
            total={pack.sentences.length}
            current={safeSentenceIndex}
            onSelect={goToSentence}
            onPrev={goPrevSentence}
            onNext={goNextSentence}
            canPrev={safeSentenceIndex > 0}
            canNext={safeSentenceIndex < pack.sentences.length - 1}
          />
        </div>
      </div>

      {/* 모바일: 연출 영역 고정 (stacked 제외) */}
      {!isStacked ? (
        <div
          className="relative z-10 shrink-0 border-b border-stone-300 bg-stone-900 lg:hidden"
          style={{
            height: minimalTyping ? 'clamp(180px, 42dvh, 280px)' : 'clamp(140px, 32dvh, 220px)',
          }}
        >
          <VisualStage layers={layers} embedded />
        </div>
      ) : null}

      {isStacked ? (
        <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-1 overflow-hidden px-2 py-1.5 sm:px-4 sm:py-2">
          <div className="flex min-h-0 flex-1 items-stretch justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-950 shadow-inner">
            <VisualStage
              layers={layers}
              overlayCaption={closingCaption}
              karaoke={karaokeProps}
              vocabGlosses={activeVocab}
              centerImages
              compact
            />
          </div>
          <div className="shrink-0 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 shadow-sm sm:px-3">
            <TypingInline
              target={target}
              typed={typed}
              onTypedChange={setTyped}
              onDraftChange={setTypingDraft}
              disabled={epilogueShown}
              karaokeOnly
              focusToken={focusToken}
            />
            <div className="mt-1">
              <PlayActions
                complete={complete}
                lastSentence={lastSentence}
                progressPct={progressPct}
                onNext={goNextSentence}
                onShowEpilogue={() => setEpilogueShown(true)}
                epilogueShown={epilogueShown}
                minimal
              />
            </div>
          </div>
        </main>
      ) : (
      <main className="mx-auto flex w-full min-h-0 max-w-6xl flex-1 flex-col overflow-hidden lg:flex-1 lg:flex-row lg:gap-4 lg:overflow-visible lg:p-4">
        {/* 데스크톱 연출 */}
        <section className="hidden min-h-0 flex-1 flex-col lg:flex lg:min-w-0 lg:flex-[1.15]">
          {!minimalTyping ? (
            <div className="mb-1.5 px-0.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">연출</h2>
            </div>
          ) : null}
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
          <div className="flex min-h-0 flex-1 flex-col p-3 lg:hidden">
            <OverlayTypingPanel
              target={target}
              typed={typed}
              onTypedChange={setTyped}
              minimal={minimalTyping}
            />
            <PlayActions
              complete={complete}
              lastSentence={lastSentence}
              progressPct={progressPct}
              onNext={goNextSentence}
              minimal={minimalTyping}
            />
          </div>

          {/* 데스크톱 */}
          <div className="hidden flex-col lg:flex">
            {!minimalTyping ? (
              <div className="mb-1.5 px-0.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">따라 쓰기</h2>
              </div>
            ) : null}
            <div className="flex flex-1 flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              {!minimalTyping ? (
                <p className="mb-3 rounded-xl bg-stone-50 px-3 py-2.5 text-lg leading-relaxed text-stone-800">
                  {target}
                </p>
              ) : null}
              <TypingPanel
                target={target}
                typed={typed}
                onTypedChange={setTyped}
                minimal={minimalTyping}
              />
              <PlayActions
                complete={complete}
                lastSentence={lastSentence}
                progressPct={progressPct}
                onNext={goNextSentence}
                minimal={minimalTyping}
              />
            </div>
          </div>
        </section>
      </main>
      )}

      {/* 모바일: 문장 넘김 — 하단 고정 */}
      <footer
        className={`z-20 shrink-0 border-t border-stone-200 bg-stone-50 px-3 py-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] ${isStacked ? '' : 'lg:hidden'}`}
      >
        <SentenceNavBar
          total={pack.sentences.length}
          current={safeSentenceIndex}
          onSelect={goToSentence}
          onPrev={goPrevSentence}
          onNext={goNextSentence}
          canPrev={safeSentenceIndex > 0}
          canNext={safeSentenceIndex < pack.sentences.length - 1}
        />
        {!minimalTyping && !isStacked ? (
          <p className="mt-1.5 text-center text-[10px] text-stone-500">
            좌우 스와이프 · 완료 후 Enter
          </p>
        ) : isStacked ? (
          <p className="mt-1 text-center text-[10px] text-stone-500">
            Enter 완료→교훈 · Enter→다음
          </p>
        ) : null}
      </footer>
    </div>
  )
}
