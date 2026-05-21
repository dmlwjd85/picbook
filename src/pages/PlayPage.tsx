import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OverlayTypingPanel } from '../components/OverlayTypingPanel'
import { TypingInline } from '../components/TypingInline'
import { TypingPanel } from '../components/TypingPanel'
import { UserLogoutButton } from '../components/UserLogoutButton'
import { SentenceNavBar } from '../components/SentenceNavBar'
import {
  SentenceNavNextDesktop,
  SentenceNavNextOverlay,
  SentenceNavPrevDesktop,
  SentenceNavPrevOverlay,
} from '../components/SentenceSideNav'
import { VisualStage } from '../components/VisualStage'
import { useSwipeSentences } from '../hooks/useSwipeSentences'
import { getLibraryBook } from '../data/libraryBooks'
import { loadCatalogPack } from '../lib/loadCatalogPack'
import { useVisualViewportLayout } from '../hooks/useKeyboardInset'
import { useMobileStageHeight } from '../hooks/useMobileStageHeight'
import { getActiveVocabGlosses, vocabTypedLength } from '../lib/getActiveVocabGlosses'
import { useTimelinePlayback } from '../hooks/useTimelinePlayback'
import { useChunkVisualLayers } from '../hooks/useChunkVisualLayers'
import { mergePlayLayers } from '../lib/mergePlayLayers'
import { playbackTypedLength, playbackTypedPrefix } from '../lib/typingMatch'
import { bookUsesChunkVisuals } from '../lib/storyVisualDictionary'
import { findVisualMatchesInText } from '../lib/matchVisualChunks'
import { getVisualDictionaryForBook, getVisualDictionaryForStory } from '../lib/storyVisualDictionary'
import { useTimelineFrameAudio } from '../hooks/useTimelineFrameAudio'
import { usePicbookTimelineStore } from '../state/picbookTimelineStore'
import { fetchPublishedBookTimelines } from '../lib/publishedTimelineFirebase'
import { usePlaySessionStore } from '../state/playSessionStore'
import { canOpenBook, useMasterPreviewMode } from '../lib/bookAccess'
import { useFullscreen } from '../hooks/useFullscreen'
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
  const unlockedIds = useUserAccountStore((s) => s.getActiveAccount()?.unlockedIds ?? [])
  const masterPreview = useMasterPreviewMode()
  const isBookUnlocked = Boolean(bookId && canOpenBook(bookId, unlockedIds, masterPreview))
  const { active: fullscreenActive, supported: fullscreenSupported, toggle: toggleFullscreen } =
    useFullscreen()
  const setSession = usePlaySessionStore((s) => s.setSession)
  const { inset: keyboardInset, height: vvHeight } = useVisualViewportLayout()

  const [pack, setPack] = useState<ReadingPack | null>(null)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [typingDraft, setTypingDraft] = useState('')
  const [epilogueShown, setEpilogueShown] = useState(false)
  const [focusToken, setFocusToken] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const overlayStageRatio = pack?.typingStyle === 'minimal' ? 0.4 : 0.34
  const stackedRatio = fullscreenActive ? 0.52 : 0.38
  const mobileStackedStagePx = useMobileStageHeight(vvHeight, keyboardInset, true, stackedRatio)
  const mobileOverlayStagePx = useMobileStageHeight(
    vvHeight,
    keyboardInset,
    true,
    fullscreenActive ? overlayStageRatio + 0.08 : overlayStageRatio,
  )

  useEffect(() => {
    document.documentElement.classList.add('play-active')
    return () => document.documentElement.classList.remove('play-active')
  }, [])

  /** 모바일 연출 높이 — CSS 변수로만 적용(lg 이상 레이아웃 유지) */
  useEffect(() => {
    const root = document.documentElement
    if (mobileStackedStagePx != null) {
      root.style.setProperty('--play-stacked-stage-h', `${mobileStackedStagePx}px`)
    } else {
      root.style.removeProperty('--play-stacked-stage-h')
    }
    if (mobileOverlayStagePx != null) {
      root.style.setProperty('--play-overlay-stage-h', `${mobileOverlayStagePx}px`)
    } else {
      root.style.removeProperty('--play-overlay-stage-h')
    }
    return () => {
      root.style.removeProperty('--play-stacked-stage-h')
      root.style.removeProperty('--play-overlay-stage-h')
    }
  }, [mobileStackedStagePx, mobileOverlayStagePx])

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

  const mergePublishedBook = usePicbookTimelineStore((s) => s.mergePublishedBook)

  useEffect(() => {
    if (!bookId) return
    let cancelled = false
    void fetchPublishedBookTimelines(bookId).then((timelines) => {
      if (cancelled || !timelines) return
      mergePublishedBook(bookId, timelines)
    })
    return () => {
      cancelled = true
    }
  }, [bookId, mergePublishedBook])

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

  const target = sentence?.text ?? ''
  const visualTypedLen = useMemo(
    () => playbackTypedLength(target, typed, typingDraft),
    [target, typed, typingDraft],
  )
  const visualTyped = useMemo(
    () => playbackTypedPrefix(typingDraft.length > typed.length ? typingDraft : typed, target),
    [target, typed, typingDraft],
  )

  const { layers: timelineLayers, stageFx } = useTimelinePlayback(bookId, sentence, visualTypedLen)
  const chunkLayers = useChunkVisualLayers(visualTyped, bookId, pack?.visualDictionaryStoryId)
  const layers = useMemo(
    () => mergePlayLayers(timelineLayers, chunkLayers),
    [timelineLayers, chunkLayers],
  )

  const useChunkMode = bookUsesChunkVisuals(bookId, pack?.visualDictionaryStoryId)
  const chunkMatchPreview = useMemo(() => {
    if (!useChunkMode || !sentence) return []
    const entries = getVisualDictionaryForStory(pack?.visualDictionaryStoryId)
    const byBook = entries.length ? entries : getVisualDictionaryForBook(bookId)
    return findVisualMatchesInText(visualTyped, byBook).slice(-6)
  }, [useChunkMode, visualTyped, bookId, pack?.visualDictionaryStoryId, sentence])
  const playTimeline = usePicbookTimelineStore((s) =>
    bookId && sentence ? s.byBook[bookId]?.[sentence.id] : undefined,
  )
  useTimelineFrameAudio(playTimeline ?? null, visualTypedLen, Boolean(sentence && !epilogueShown))
  const complete = target.length > 0 && typed === target
  const lastSentence = pack ? safeSentenceIndex >= pack.sentences.length - 1 : true
  const progressPct = target.length > 0 ? Math.round((typed.length / target.length) * 100) : 0
  const sentenceCount = pack?.sentences.length ?? 0
  const sentenceLabels = useMemo(() => pack?.sentences.map((s) => s.text) ?? [], [pack?.sentences])

  const goToSentence = useCallback(
    (index: number) => {
      if (sentenceCount === 0) return
      startTransition(() => {
        setSentenceIndex(Math.min(Math.max(0, index), sentenceCount - 1))
        setFocusToken((t) => t + 1)
      })
    },
    [sentenceCount],
  )

  const goPrevSentence = useCallback(() => {
    startTransition(() => {
      setSentenceIndex((i) => Math.max(0, i - 1))
    })
  }, [])

  const goNextSentence = useCallback(() => {
    startTransition(() => {
      setSentenceIndex((i) => Math.min(i + 1, Math.max(0, sentenceCount - 1)))
      setFocusToken((t) => t + 1)
    })
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
  const centerImages = Boolean(isStacked && (useChunkMode || bookId === 'elementary-proverbs'))

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
  const showMobileEpilogueFullscreen =
    isStacked && epilogueShown && Boolean(closingCaption)
  const karaokeProps =
    isStacked && !epilogueShown
      ? { target, draft: typingDraft, committed: typed }
      : null

  const vocabLen =
    sentence && target ? vocabTypedLength(target, typed, typingDraft) : 0

  const activeVocab =
    isStacked && sentence && !epilogueShown
      ? getActiveVocabGlosses(sentence, vocabLen)
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
            {fullscreenSupported ? (
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-700 hover:bg-white lg:hidden"
              >
                {fullscreenActive ? '축소' : '전체'}
              </button>
            ) : null}
            <UserLogoutButton className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-600 hover:bg-white lg:hidden" />
            <div className="hidden text-right text-xs text-stone-500 lg:block">
              <span className="font-mono text-stone-700">{progressPct}%</span>
              <span className="ml-1">입력</span>
            </div>
            {fullscreenSupported ? (
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="hidden rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-white lg:inline-flex"
              >
                {fullscreenActive ? '전체화면 끄기' : '전체화면'}
              </button>
            ) : null}
            <UserLogoutButton className="hidden rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:bg-white lg:inline-flex" />
          </div>
        </div>
      </header>

      {showMobileEpilogueFullscreen ? (
        <div
          className="fixed inset-0 z-50 flex min-h-0 flex-col bg-black lg:hidden"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-1">
            <div className="relative aspect-[3/2] w-full max-h-full max-w-[min(100vw,calc((100dvh-10rem)*1.5))]">
              <VisualStage
                layers={layers}
                overlayCaption={closingCaption}
                centerImages={centerImages}
                embedded
                epilogueFullscreen
                {...stageFx}
              />
            </div>
          </div>
          <div className="shrink-0 border-t border-white/10 bg-black/90 px-4 py-3">
            {lastSentence ? (
              <Link
                to="/bookshelf"
                className="flex w-full items-center justify-center rounded-2xl bg-stone-700 py-3.5 text-base font-bold text-white shadow-lg active:scale-[0.98]"
              >
                책장으로 돌아가기
              </Link>
            ) : (
              <button
                type="button"
                className="w-full rounded-2xl bg-amber-700 py-3.5 text-base font-bold text-white shadow-lg active:scale-[0.98] hover:bg-amber-800"
                onClick={goNextSentence}
              >
                다음 속담 →
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className="z-20 hidden shrink-0 border-b border-stone-200 bg-stone-50 px-5 py-2 lg:block">
        <div className="mx-auto max-w-6xl">
          <SentenceNavBar
            total={pack.sentences.length}
            current={safeSentenceIndex}
            onSelect={goToSentence}
            onPrev={goPrevSentence}
            onNext={goNextSentence}
            canPrev={safeSentenceIndex > 0}
            canNext={safeSentenceIndex < pack.sentences.length - 1}
            dotsOnly={isStacked}
            sentenceLabels={sentenceLabels}
          />
        </div>
      </div>

      {/* 모바일: 연출 영역 고정 (stacked 제외) */}
      {!isStacked ? (
        <div
          className="play-stage-mobile play-stage-overlay relative z-10 shrink-0 overflow-hidden bg-stone-900 lg:hidden"
        >
          <VisualStage layers={layers} embedded {...stageFx} />
          <SentenceNavPrevOverlay
            canPrev={safeSentenceIndex > 0}
            onPrev={goPrevSentence}
          />
          <SentenceNavNextOverlay
            canNext={safeSentenceIndex < pack.sentences.length - 1}
            onNext={goNextSentence}
          />
        </div>
      ) : null}

      {isStacked ? (
        <main
          className={`mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-1 overflow-hidden px-2 py-1 sm:px-4 sm:py-2 lg:flex-row lg:items-stretch lg:gap-3${showMobileEpilogueFullscreen ? ' max-lg:hidden' : ''}`}
        >
          <SentenceNavPrevDesktop
            canPrev={safeSentenceIndex > 0}
            onPrev={goPrevSentence}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1">
          <div className="play-stage-mobile play-stage-stacked relative z-10 w-full shrink-0 overflow-hidden bg-stone-900 lg:min-h-[min(56vh,560px)] lg:flex-1 lg:rounded-lg">
            <VisualStage
              layers={layers}
              overlayCaption={closingCaption}
              karaoke={karaokeProps}
              vocabGlosses={activeVocab}
              centerImages={centerImages}
              compact
              large
              {...stageFx}
            />
            <SentenceNavPrevOverlay
              canPrev={safeSentenceIndex > 0}
              onPrev={goPrevSentence}
            />
            <SentenceNavNextOverlay
              canNext={safeSentenceIndex < pack.sentences.length - 1}
              onNext={goNextSentence}
            />
          </div>
          <div
            key={sentence.id}
            className="play-sentence-in z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 shadow-sm sm:px-3"
            style={{
              paddingBottom: keyboardInset > 0 ? `${keyboardInset + 8}px` : undefined,
            }}
          >
            <TypingInline
              target={target}
              typed={typed}
              onTypedChange={setTyped}
              onDraftChange={setTypingDraft}
              disabled={epilogueShown}
              karaokeOnly
              focusToken={focusToken}
            />
            {useChunkMode && chunkMatchPreview.length > 0 ? (
              <div className="mt-2 rounded-lg border border-lime-200 bg-lime-50/90 px-2 py-1.5">
                <p className="text-[10px] font-bold text-lime-900">지금 그려진 의미</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {chunkMatchPreview.map((m) => (
                    <span
                      key={`${m.entry.word_id}-${m.start}`}
                      className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-lime-900 ring-1 ring-lime-300"
                    >
                      {m.entry.word}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
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
          </div>
          <SentenceNavNextDesktop
            canNext={safeSentenceIndex < pack.sentences.length - 1}
            onNext={goNextSentence}
          />
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
          <div className="relative flex min-h-[min(50vh,420px)] flex-1 items-center overflow-hidden rounded-lg bg-stone-900">
            <VisualStage layers={layers} {...stageFx} />
            <SentenceNavPrevOverlay
              canPrev={safeSentenceIndex > 0}
              onPrev={goPrevSentence}
            />
            <SentenceNavNextOverlay
              canNext={safeSentenceIndex < pack.sentences.length - 1}
              onNext={goNextSentence}
            />
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
        className={`z-30 shrink-0 border-t border-stone-200 bg-stone-50 px-3 py-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] ${isStacked ? (showMobileEpilogueFullscreen ? 'max-lg:hidden' : 'lg:hidden') : 'lg:hidden'}`}
      >
        <SentenceNavBar
          total={pack.sentences.length}
          current={safeSentenceIndex}
          onSelect={goToSentence}
          onPrev={goPrevSentence}
          onNext={goNextSentence}
          canPrev={safeSentenceIndex > 0}
          canNext={safeSentenceIndex < pack.sentences.length - 1}
          dotsOnly={isStacked}
          sentenceLabels={sentenceLabels}
        />
        {!minimalTyping && !isStacked ? (
          <p className="mt-1.5 text-center text-[10px] text-stone-500">
            좌우 스와이프 · 완료 후 Enter
          </p>
        ) : isStacked ? (
          <p className="mt-1 text-center text-[10px] text-stone-500">
            양옆 버튼·스와이프 · Enter 완료→교훈
          </p>
        ) : null}
      </footer>
    </div>
  )
}
