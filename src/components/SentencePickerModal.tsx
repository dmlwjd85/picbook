import { useEffect } from 'react'

type Props = {
  open: boolean
  total: number
  current: number
  labels: string[]
  onSelect: (index: number) => void
  onClose: () => void
}

function preview(text: string, max = 36) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

/** 문장 목록 — 스크롤해서 선택 */
export function SentencePickerModal({ open, total, current, labels, onSelect, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="문장 고르기"
        className="flex max-h-[min(78dvh,520px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-stone-200 px-4 py-3">
          <h2 className="text-sm font-bold text-stone-900">문장 고르기</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            {current + 1} / {total} · 따라 쓸 속담을 선택하세요
          </p>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          {labels.map((label, i) => {
            const selected = i === current
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(i)
                    onClose()
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition ${
                    selected ? 'bg-amber-50' : 'hover:bg-stone-50'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected ? 'bg-amber-800 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-sm leading-snug ${
                      selected ? 'font-semibold text-amber-950' : 'text-stone-800'
                    }`}
                  >
                    {preview(label)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="shrink-0 border-t border-stone-200 p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
