import { useEffect, useMemo, useRef, useState } from 'react'
import {
  activePanelIndex,
  computeAutoCueIndexes,
  normalizeCueIndexes,
  validatePanelSentence,
} from '../../lib/autoPanelSentence'
import { isLocalOnlyImage, savePanelImage } from '../../lib/panelImage'
import { PANEL_MAX, PANEL_MIN, type PanelSentence } from '../../types/customPicbook'

/** 그림 번호별 색 — 그림 칸과 타임라인 글자가 같은 색을 쓴다 */
const PANEL_COLORS = [
  'bg-orange-200 text-orange-950',
  'bg-sky-200 text-sky-950',
  'bg-emerald-200 text-emerald-950',
  'bg-violet-200 text-violet-950',
  'bg-rose-200 text-rose-950',
  'bg-amber-200 text-amber-950',
  'bg-teal-200 text-teal-950',
  'bg-fuchsia-200 text-fuchsia-950',
]
const PANEL_RINGS = [
  'ring-orange-500',
  'ring-sky-500',
  'ring-emerald-500',
  'ring-violet-500',
  'ring-rose-500',
  'ring-amber-500',
  'ring-teal-500',
  'ring-fuchsia-500',
]

type Props = {
  bookId: string
  /** 창 제목 (예: "3번 문장 고치기") */
  heading: string
  initial: PanelSentence
  onSave: (next: PanelSentence) => void
  /** 있으면 「검수 완료 · 다음 문장」 버튼이 보인다 — 저장 + 검수 표시 + 다음 문장 열기 */
  onSaveAndNext?: (next: PanelSentence) => void
  onClose: () => void
  /** 기본 제공 픽북에서 수정한 문장일 때만 — 원본으로 되돌리기 */
  onReset?: () => void
}

/** 문장 하나의 편집창: ① 문장 ② 그림 ③ 그림이 바뀌는 위치 + 미리 보기 */
export function PanelSentenceEditor({ bookId, heading, initial, onSave, onSaveAndNext, onClose, onReset }: Props) {
  const [text, setText] = useState(initial.text)
  const [closingLine, setClosingLine] = useState(initial.closingLine ?? '')
  const [images, setImages] = useState<string[]>(initial.images)
  const [cues, setCues] = useState<number[]>(() =>
    normalizeCueIndexes(initial.text, initial.cueIndexes, initial.images.length),
  )
  /** 타임라인에서 위치를 옮길 그림 (0번은 항상 문장 시작이라 고를 수 없다) */
  const [selected, setSelected] = useState(1)
  const [previewLen, setPreviewLen] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const replaceIndexRef = useRef(0)

  const chars = useMemo(() => Array.from({ length: text.length }, (_, i) => text[i]), [text])
  const problem = validatePanelSentence(text, images.length)
  const active = activePanelIndex(cues, previewLen)

  // 문장이나 그림 수가 바뀌면 등장 위치를 다시 고르게 나눈다
  const reflow = (nextText: string, count: number) => {
    setCues(computeAutoCueIndexes(nextText, count))
    setPreviewLen((n) => Math.min(n, nextText.length))
    setSelected((s) => Math.min(Math.max(1, s), Math.max(1, count - 1)))
  }

  useEffect(() => {
    if (!playing) return
    if (previewLen >= text.length) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setPreviewLen((n) => n + 1), 160)
    return () => window.clearTimeout(id)
  }, [playing, previewLen, text.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const uploadFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files || files.length === 0) return []
    setBusy(true)
    setError(null)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) urls.push(await savePanelImage(bookId, file))
      return urls
    } catch (e) {
      setError(e instanceof Error ? e.message : '그림을 올리지 못했어요.')
      return []
    } finally {
      setBusy(false)
    }
  }

  const onAddFiles = async (files: FileList | null) => {
    const room = PANEL_MAX - images.length
    if (files && files.length > room) {
      setError(`그림은 최대 ${PANEL_MAX}장이에요. 앞에서부터 ${room}장만 넣었어요.`)
    }
    const picked = files ? (Array.from(files).slice(0, room) as unknown as FileList) : null
    const urls = await uploadFiles(picked)
    if (urls.length === 0) return
    const next = [...images, ...urls]
    setImages(next)
    reflow(text, next.length)
  }

  const onReplaceFile = async (files: FileList | null) => {
    const [url] = await uploadFiles(files)
    if (!url) return
    setImages((list) => list.map((u, i) => (i === replaceIndexRef.current ? url : u)))
  }

  const moveImage = (index: number, dir: -1 | 1) => {
    const to = index + dir
    if (to < 0 || to >= images.length) return
    setImages((list) => {
      const next = [...list]
      ;[next[index], next[to]] = [next[to], next[index]]
      return next
    })
  }

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    setImages(next)
    reflow(text, next.length)
  }

  /** 그림 panel이 나타나는 글자 위치를 옮긴다 — 앞뒤 그림을 넘어가지 않게 막는다 */
  const setCueAt = (panel: number, charIndex: number) => {
    if (panel <= 0 || panel >= cues.length) return
    const min = cues[panel - 1] + 1
    const max = (panel + 1 < cues.length ? cues[panel + 1] : text.length) - 1
    if (max < min) return
    const next = [...cues]
    next[panel] = Math.min(Math.max(charIndex, min), max)
    setCues(next)
    setPreviewLen(next[panel])
  }

  const save = (handler: (next: PanelSentence) => void) => {
    if (problem) {
      setError(problem)
      return
    }
    handler({
      id: initial.id,
      text,
      images,
      cueIndexes: normalizeCueIndexes(text, cues, images.length),
      ...(closingLine.trim() ? { closingLine: closingLine.trim() } : {}),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">{heading}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            닫기 ✕
          </button>
        </header>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* ① 문장 */}
            <section>
              <h3 className="text-sm font-bold text-slate-900">① 따라 쓸 문장</h3>
              <textarea
                rows={2}
                value={text}
                onChange={(e) => {
                  const next = e.target.value.replace(/\n/g, ' ')
                  setText(next)
                  reflow(next, images.length)
                }}
                placeholder="예: 가는 말이 고와야 오는 말이 곱다"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <label className="mt-2 block text-xs font-medium text-slate-600">
                다 쓴 뒤 보여 줄 한 줄 (뜻·교훈, 선택)
                <input
                  value={closingLine}
                  onChange={(e) => setClosingLine(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                />
              </label>
            </section>

            {/* ② 그림 */}
            <section>
              <div className="flex items-end justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  ② 그림 {PANEL_MIN}~{PANEL_MAX}장{' '}
                  <span
                    className={`ml-1 font-semibold ${
                      images.length < PANEL_MIN || images.length > PANEL_MAX ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    (지금 {images.length}장)
                  </span>
                </h3>
                <p className="text-xs text-slate-500">왼쪽부터 차례로 나타나요</p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${
                      active === i ? `ring-2 ${PANEL_RINGS[i]}` : ''
                    }`}
                  >
                    <div className="relative aspect-[3/2] bg-slate-200">
                      <img src={url} alt={`그림 ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
                      <span
                        className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-xs font-bold ${PANEL_COLORS[i]}`}
                      >
                        {i + 1}
                      </span>
                      {isLocalOnlyImage(url) ? (
                        <span className="absolute bottom-1 right-1 rounded bg-slate-900/70 px-1 text-[10px] text-white">
                          이 기기에만
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-1 whitespace-nowrap px-1.5 py-1 text-xs">
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          aria-label={`그림 ${i + 1} 앞으로`}
                          disabled={i === 0}
                          onClick={() => moveImage(i, -1)}
                          className="rounded px-1.5 py-0.5 font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          aria-label={`그림 ${i + 1} 뒤로`}
                          disabled={i === images.length - 1}
                          onClick={() => moveImage(i, 1)}
                          className="rounded px-1.5 py-0.5 font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          ▶
                        </button>
                      </div>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            replaceIndexRef.current = i
                            replaceInputRef.current?.click()
                          }}
                          className="rounded px-1.5 py-0.5 font-semibold text-slate-600 hover:bg-slate-200"
                        >
                          바꾸기
                        </button>
                        <button
                          type="button"
                          aria-label={`그림 ${i + 1} 빼기`}
                          onClick={() => removeImage(i)}
                          className="rounded px-1.5 py-0.5 font-semibold text-red-600 hover:bg-red-50"
                        >
                          빼기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {images.length < PANEL_MAX ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => addInputRef.current?.click()}
                    className="flex aspect-[3/2] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-50"
                  >
                    <span className="text-2xl leading-none">＋</span>
                    {busy ? '올리는 중…' : '그림 넣기'}
                  </button>
                ) : null}
              </div>
              <input
                ref={addInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  void onAddFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  void onReplaceFile(e.target.files)
                  e.target.value = ''
                }}
              />
            </section>

            {/* ③ 타임라인 */}
            <section>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">③ 그림이 바뀌는 위치</h3>
                <button
                  type="button"
                  onClick={() => reflow(text, images.length)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  자동으로 고르게 나누기
                </button>
              </div>
              {images.length < 2 || text.length === 0 ? (
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  문장과 그림을 넣으면 여기에 타임라인이 나타나요.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-xs text-slate-500">
                    옮길 그림 번호를 고른 다음, 그 그림이 나타날 글자를 누르세요. 글자 색이 곧 그 순간 보이는 그림이에요.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={i === 0}
                        onClick={() => {
                          setSelected(i)
                          setPreviewLen(cues[i] ?? 0)
                        }}
                        title={i === 0 ? '첫 그림은 항상 문장 시작에 나타나요' : undefined}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${PANEL_COLORS[i]} ${
                          selected === i ? `ring-2 ring-offset-1 ${PANEL_RINGS[i]}` : 'opacity-80'
                        } disabled:cursor-not-allowed`}
                      >
                        그림 {i + 1}{' '}
                        <span className="font-medium opacity-70">
                          {i === 0 ? '시작' : `${cues[i]}번째 글자`}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    {chars.map((ch, i) => {
                      const panel = activePanelIndex(cues, i)
                      const isStart = cues[panel] === i
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCueAt(selected, i)}
                          aria-label={`${i}번째 글자 ${ch === ' ' ? '띄어쓰기' : ch}`}
                          className={`relative h-9 min-w-[1.6rem] px-1 text-base font-semibold ${PANEL_COLORS[panel]} ${
                            isStart ? 'ml-1 rounded-l-md border-l-4 border-slate-900/70' : ''
                          } ${i < previewLen ? '' : 'opacity-60'} hover:brightness-95`}
                        >
                          {ch === ' ' ? ' ' : ch}
                          {isStart ? (
                            <span className="absolute -top-2 left-0 rounded bg-slate-900 px-1 text-[9px] font-bold leading-tight text-white">
                              {panel + 1}
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold">그림 {selected + 1} 미세 조정</span>
                    <button
                      type="button"
                      onClick={() => setCueAt(selected, cues[selected] - 1)}
                      className="rounded border border-slate-300 px-2 py-0.5 font-bold hover:bg-slate-100"
                    >
                      ◀ 한 글자 앞
                    </button>
                    <button
                      type="button"
                      onClick={() => setCueAt(selected, cues[selected] + 1)}
                      className="rounded border border-slate-300 px-2 py-0.5 font-bold hover:bg-slate-100"
                    >
                      한 글자 뒤 ▶
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>

          {/* 미리 보기 */}
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <h3 className="text-sm font-bold text-slate-900">미리 보기</h3>
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
              <div className="aspect-[3/2]">
                {images[active] ? (
                  <img src={images[active]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">그림 없음</div>
                )}
              </div>
              <p className="min-h-[3rem] bg-white px-3 py-2 text-base font-semibold leading-relaxed">
                <span className="text-slate-900">{text.slice(0, previewLen)}</span>
                <span className="text-slate-300">{text.slice(previewLen)}</span>
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={text.length}
              value={previewLen}
              onChange={(e) => {
                setPlaying(false)
                setPreviewLen(Number(e.target.value))
              }}
              aria-label="타자 진행"
              className="mt-3 w-full accent-orange-600"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>
                {previewLen} / {text.length}글자
              </span>
              <button
                type="button"
                onClick={() => {
                  if (previewLen >= text.length) setPreviewLen(0)
                  setPlaying((p) => !p)
                }}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
              >
                {playing ? '멈춤' : '▶ 재생해 보기'}
              </button>
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <p className={`text-sm font-medium ${error || problem ? 'text-red-600' : 'text-slate-500'}`}>
            {error ?? problem ?? '저장하면 이 기기에 반영돼요. 모두에게 보이려면 책 화면에서 「배포하기」를 누르세요.'}
          </p>
          <div className="flex gap-2">
            {onReset ? (
              <button
                type="button"
                onClick={onReset}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                원래대로 되돌리기
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => save(onSave)}
              disabled={busy || Boolean(problem)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-40 ${
                onSaveAndNext
                  ? 'border border-orange-600 text-orange-700 hover:bg-orange-50'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              저장
            </button>
            {onSaveAndNext ? (
              <button
                type="button"
                onClick={() => save(onSaveAndNext)}
                disabled={busy || Boolean(problem)}
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-40"
              >
                검수 완료 · 다음 문장 ▶
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  )
}
