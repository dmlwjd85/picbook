type Props = {
  total: number
  current: number
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
  /** 하단에는 번호만 (이전·다음은 양옆 버튼) */
  dotsOnly?: boolean
}

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
}: Props) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white/90 px-2 py-2 shadow-sm sm:px-3 ${
        dotsOnly ? 'justify-center' : 'justify-between'
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
  )
}
