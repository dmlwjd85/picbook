import { useState } from 'react'
import { SentencePickerModal } from './SentencePickerModal'

type Props = {
  total: number
  current: number
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
  dotsOnly?: boolean
  /** 문장 미리보기 텍스트 (팝업용) */
  sentenceLabels?: string[]
}

const PICKER_THRESHOLD = 6

/** 문장 선택·페이지 넘김 */
export function SentenceNavBar({
  total,
  current,
  onSelect,
  onPrev,
  onNext,
  canPrev,
  canNext,
  dotsOnly = false,
  sentenceLabels = [],
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const usePicker = dotsOnly || total > PICKER_THRESHOLD
  const labels =
    sentenceLabels.length >= total
      ? sentenceLabels.slice(0, total)
      : Array.from({ length: total }, (_, i) => `${i + 1}번`)

  return (
    <>
      <div
        className={`flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white/90 px-2 py-2 shadow-sm sm:px-3 ${
          dotsOnly || usePicker ? 'justify-center' : 'justify-between'
        }`}
      >
        {!dotsOnly ? (
          <button
            type="button"
            disabled={!canPrev}
            onClick={onPrev}
            className="rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-bold text-stone-700 enabled:hover:bg-stone-50 disabled:opacity-35"
            aria-label="이전 문장"
          >
            ◀ 이전
          </button>
        ) : null}

        {usePicker ? (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="relative z-10 min-h-[2.5rem] min-w-[11rem] shrink-0 rounded-lg border-2 border-amber-500 bg-amber-100 px-4 py-2.5 text-xs font-bold text-amber-950 shadow-md hover:bg-amber-200 sm:min-w-[12rem] sm:text-sm"
            aria-haspopup="dialog"
          >
            {current + 1} / {total} · 문장 고르기
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1" role="tablist" aria-label="문장 선택">
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                onClick={() => onSelect(i)}
                className={`min-w-[2rem] rounded-lg px-2 py-1 text-xs font-bold transition ${
                  i === current
                    ? 'bg-amber-800 text-amber-50 shadow'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {!dotsOnly ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={onNext}
            className="rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-bold text-stone-700 enabled:hover:bg-stone-50 disabled:opacity-35"
            aria-label="다음 문장"
          >
            다음 ▶
          </button>
        ) : null}
      </div>

      <SentencePickerModal
        open={pickerOpen}
        total={total}
        current={current}
        labels={labels}
        onSelect={onSelect}
        onClose={() => setPickerOpen(false)}
      />
    </>
  )
}
