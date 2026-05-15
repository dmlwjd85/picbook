import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TypingPanel } from '../components/TypingPanel'
import { VisualStage } from '../components/VisualStage'
import { getLibraryBook } from '../data/libraryBooks'
import { computeLayerSnapshot } from '../lib/cueEngine'
import { usePlaySessionStore } from '../state/playSessionStore'
import { useUserProfileStore } from '../state/userProfileStore'
import type { ReadingPack } from '../types/pack'

export default function PlayPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const profile = useUserProfileStore((s) => s.profile)
  const sessionPack = usePlaySessionStore((s) => s.pack)
  const sessionBookId = usePlaySessionStore((s) => s.bookId)
  const setSession = usePlaySessionStore((s) => s.setSession)

  const [pack, setPack] = useState<ReadingPack | null>(null)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [typed, setTyped] = useState('')

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
    <div className="flex min-h-full flex-col bg-stone-100">
      <header className="shrink-0 border-b border-stone-200 bg-white px-3 py-2.5 shadow-sm sm:px-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/bookshelf"
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-50"
            >
              ← 책장
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-stone-900 sm:text-lg">{pack.title}</h1>
              <p className="text-xs text-stone-500">
                {profile?.name} · 문장 {sentenceIndex + 1}/{pack.sentences.length}
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 text-right text-xs text-stone-500 sm:block">
            <span className="font-mono text-stone-700">{progressPct}%</span>
            <span className="ml-1">입력</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:flex-row lg:items-stretch">
        <section className="flex min-h-0 flex-1 flex-col lg:min-w-0 lg:flex-[1.15]">
          <div className="mb-1.5 px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">연출</h2>
          </div>
          <div className="flex min-h-[min(42vh,360px)] flex-1 items-center rounded-2xl border border-stone-200 bg-stone-900/95 p-2 shadow-inner sm:min-h-[min(50vh,420px)] sm:p-3">
            <VisualStage layers={layers} />
          </div>
        </section>

        <section className="flex w-full shrink-0 flex-col lg:w-[min(100%,380px)] lg:max-w-md">
          <div className="mb-1.5 px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">따라 쓰기</h2>
          </div>
          <div className="flex flex-1 flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="mb-3 rounded-xl bg-stone-50 px-3 py-2.5 text-base leading-relaxed text-stone-800 sm:text-lg">
              {target}
            </p>

            <TypingPanel target={target} typed={typed} onTypedChange={setTyped} />

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-amber-700 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {complete ? (
                <button
                  type="button"
                  className="rounded-xl bg-amber-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-900 disabled:opacity-40"
                  disabled={lastSentence}
                  onClick={() => setSentenceIndex((i) => i + 1)}
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
          </div>
        </section>
      </main>
    </div>
  )
}
