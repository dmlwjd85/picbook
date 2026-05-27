type BtnProps = {
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

const base =
  'rounded-full border font-bold shadow-lg backdrop-blur-sm transition enabled:hover:scale-[1.03] disabled:opacity-25 disabled:hover:scale-100'

/** 모바일 연출 위 — 반투명 이전 */
export function SentenceNavPrevOverlay({ canPrev, onPrev }: Pick<BtnProps, 'canPrev' | 'onPrev'>) {
  return (
    <button
      type="button"
      disabled={!canPrev}
      onClick={onPrev}
      aria-label="이전 문장"
      className={`absolute left-1 top-1/2 z-40 -translate-y-1/2 lg:hidden ${base} border-white/30 bg-black/45 px-2 py-3 text-xs text-white enabled:hover:bg-black/60 sm:left-2 sm:px-2.5 sm:text-sm`}
    >
      ◀
    </button>
  )
}

/** 모바일 연출 위 — 반투명 다음 */
export function SentenceNavNextOverlay({ canNext, onNext }: Pick<BtnProps, 'canNext' | 'onNext'>) {
  return (
    <button
      type="button"
      disabled={!canNext}
      onClick={onNext}
      aria-label="다음 문장으로"
      className={`absolute right-1 top-1/2 z-40 -translate-y-1/2 lg:hidden ${base} border-white/30 bg-black/45 px-2 py-3 text-xs text-white enabled:hover:bg-black/60 sm:right-2 sm:px-2.5 sm:text-sm`}
    >
      ▶
    </button>
  )
}

/** 웹 — 연출 양옆 여백 */
export function SentenceNavPrevDesktop({ canPrev, onPrev }: Pick<BtnProps, 'canPrev' | 'onPrev'>) {
  return (
    <button
      type="button"
      disabled={!canPrev}
      onClick={onPrev}
      aria-label="이전 문장"
      className={`hidden shrink-0 self-center lg:inline-flex ${base} border-stone-300 bg-white px-3 py-4 text-sm text-stone-800 enabled:hover:bg-stone-50`}
    >
      ◀ 이전
    </button>
  )
}

export function SentenceNavNextDesktop({ canNext, onNext }: Pick<BtnProps, 'canNext' | 'onNext'>) {
  return (
    <button
      type="button"
      disabled={!canNext}
      onClick={onNext}
      aria-label="다음 문장으로"
      className={`hidden shrink-0 self-center lg:inline-flex ${base} border-stone-300 bg-white px-3 py-4 text-sm text-stone-800 enabled:hover:bg-stone-50`}
    >
      다음 ▶
    </button>
  )
}
