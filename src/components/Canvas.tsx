import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useBookStore } from '../store/useBookStore'
import type { Sentence } from '../store/useBookStore'

function Spinner() {
  return (
    <div
      className="h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin"
      aria-label="로딩 중"
    />
  )
}

function SentenceCard({ s }: { s: Sentence }) {
  const ready = s.status === 'done' && Boolean(s.imageUrl)
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="relative aspect-[16/10] bg-slate-50">
        {s.status !== 'done' ? (
          <>
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 border border-slate-200 shadow-sm backdrop-blur">
                <Spinner />
                <span className="text-sm text-slate-700">
                  {s.isComplete ? '스케치 중…' : '문장 입력 중…'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <img
            src={s.imageUrl ?? ''}
            alt={s.text}
            className="absolute inset-0 h-full w-full object-cover opacity-0 animate-fade"
            loading="lazy"
          />
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <p
            className="text-[15px] leading-relaxed text-slate-900"
            style={{ fontFamily: 'var(--pb-font)' }}
          >
            {s.text}
          </p>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span
              className={[
                'text-[11px] rounded-full px-2 py-1 border',
                s.status === 'done'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : s.status === 'loading'
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200',
              ].join(' ')}
            >
              {s.status === 'done' ? '완료' : s.status === 'loading' ? '생성중' : '대기'}
            </span>

            <Link
              to={`/direct/${s.id}`}
              className={[
                'rounded-xl px-3 py-2 text-[11px] font-semibold border transition',
                ready ? 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50' : 'pointer-events-none opacity-40',
              ].join(' ')}
            >
              디렉팅
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export function Canvas() {
  const sentences = useBookStore((s) => s.sentences)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const hasAny = sentences.length > 0

  const signature = useMemo(() => {
    const last = sentences.at(-1)
    if (!last) return 'none'
    return `${sentences.length}:${last.id}:${last.status}:${last.text.length}`
  }, [sentences])

  useEffect(() => {
    // 새 문장이 추가되거나, 마지막 문장의 상태가 바뀌면 자연스럽게 아래로 스크롤
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [signature])

  return (
    <section className="h-full bg-gradient-to-b from-slate-50 to-white">
      <header className="px-5 py-4 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">그림일기 캔버스</h2>
          <div className="text-xs text-slate-500">완성된 문장부터 이미지가 순서대로 쌓입니다.</div>
        </div>
      </header>

      <div ref={wrapRef} className="h-[calc(100%-57px)] overflow-auto px-5 py-5">
        {!hasAny ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-semibold">
                PB
              </div>
              <p className="mt-4 text-slate-700 font-medium">오른쪽에 그림일기가 나타납니다</p>
              <p className="mt-2 text-sm text-slate-500">
                왼쪽에서 문장을 입력하고 <span className="font-medium">마침표/물음표/느낌표/줄바꿈</span>으로
                문장을 끝내보세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[860px] flex flex-col gap-5">
            {sentences.map((s) => (
              <SentenceCard key={s.id} s={s} />
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>
    </section>
  )
}

