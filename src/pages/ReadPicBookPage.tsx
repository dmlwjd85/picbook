import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useBookStore } from '../store/useBookStore'

function directingImageStyle(input: {
  scale: number
  translateX: number
  translateY: number
  rotateDeg: number
  brightness: number
  contrast: number
}): CSSProperties {
  const { scale, translateX, translateY, rotateDeg, brightness, contrast } = input
  return {
    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotateDeg}deg) scale(${scale})`,
    filter: `brightness(${brightness}) contrast(${contrast})`,
    transformOrigin: '50% 50%',
    willChange: 'transform, filter',
  }
}

export default function ReadPicBookPage() {
  const { picBookId } = useParams()
  const book = useBookStore((s) => s.picBooks.find((b) => b.id === picBookId))
  const [typedByPage, setTypedByPage] = useState<Record<string, string>>({})

  if (!picBookId) {
    return <div className="p-6 text-sm text-slate-600">픽북 ID가 없습니다.</div>
  }

  if (!book) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">픽북을 찾을 수 없습니다.</p>
        <Link className="mt-3 inline-block text-sm font-semibold text-violet-700" to="/library">
          책장으로 돌아가기
        </Link>
      </div>
    )
  }

  if (!book.purchased) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">이 픽북은 구매 후 열람할 수 있습니다.</p>
        <Link className="mt-3 inline-block text-sm font-semibold text-violet-700" to="/library">
          책장으로 이동
        </Link>
      </div>
    )
  }

  if (!book.published) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">이 픽북은 서점에서 내려진(비공개) 상태입니다.</p>
        <Link className="mt-3 inline-block text-sm font-semibold text-violet-700" to="/store">
          서점으로 이동
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="text-xs text-slate-500">
          <Link to="/library" className="font-semibold text-violet-700">
            ← 책장
          </Link>
        </div>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{book.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          총 {book.pages.length}페이지 · 문장을 따라 타이핑하면 편집된 낱말 장면이 순서대로 나타납니다.
        </p>

        <div className="mt-6 flex flex-col gap-6">
          {book.pages.map((p, idx) => {
            const typed = typedByPage[p.sentenceId] ?? ''
            const progress = p.text.length === 0 ? 0 : Math.min(1, typed.length / p.text.length)
            const visibleScenes = p.wordScenes.filter((scene) => {
              const position = p.text.indexOf(scene.word)
              if (position === -1) return typed.includes(scene.word)
              return typed.length >= position + Math.max(1, Math.ceil(scene.word.length / 2))
            })
            const expectedPrefix = p.text.slice(0, typed.length)
            const isMistyped = typed.length > 0 && typed !== expectedPrefix

            return (
              <section key={`${book.id}-${p.sentenceId}`} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="relative aspect-[16/10] bg-slate-50">
                  <img
                    src={p.imageUrl}
                    alt={p.text}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ ...directingImageStyle(p.directing), opacity: Math.max(0.28, progress) }}
                  />
                  <div className="absolute inset-0 bg-slate-950/10" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold border border-slate-200">
                    {idx + 1}
                  </div>
                  <div className="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {visibleScenes.length === 0 ? (
                      <div className="col-span-full rounded-xl bg-white/85 px-3 py-2 text-xs font-semibold text-slate-700">
                        타이핑을 시작하면 장면이 나타납니다.
                      </div>
                    ) : (
                      visibleScenes.map((scene) => (
                        <div key={`${p.sentenceId}-${scene.id}`} className="overflow-hidden rounded-xl border border-white/80 bg-white/90 shadow-sm">
                          <div className="aspect-video bg-slate-100">
                            <img src={scene.imageUrl} alt={scene.word} className="h-full w-full object-cover" />
                          </div>
                          <div className="px-2 py-1 text-[11px] font-semibold text-slate-800">{scene.word}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-slate-200">
                  <p className="text-sm text-slate-900 leading-relaxed" style={{ fontFamily: 'var(--pb-font)' }}>
                    <span className="text-emerald-700">{p.text.slice(0, typed.length)}</span>
                    <span>{p.text.slice(typed.length)}</span>
                  </p>
                  <label className="mt-3 block text-xs font-semibold text-slate-700">
                    타자 연습
                    <textarea
                      value={typed}
                      onChange={(e) => setTypedByPage((prev) => ({ ...prev, [p.sentenceId]: e.target.value }))}
                      rows={2}
                      placeholder="위 문장을 그대로 입력해 보세요."
                      className={[
                        'mt-1 w-full resize-none rounded-xl border px-3 py-2 text-sm leading-relaxed',
                        isMistyped ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white',
                      ].join(' ')}
                    />
                  </label>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress * 100}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    진행률 {Math.round(progress * 100)}% · 등장 장면 {visibleScenes.length}/{p.wordScenes.length}
                    {isMistyped ? <span className="ml-2 font-semibold text-rose-600">입력한 문장이 원문과 달라요.</span> : null}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
