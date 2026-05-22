type Props = {
  target: string
  draft: string
  committed: string
  /** 연출 위(밝은 글자) / 입력 패널(어두운 글자) */
  variant?: 'stage' | 'panel'
  className?: string
}

/** 따라 쓸 목표 문장 — 입력 진행에 맞춰 글자별 강조 */
export function PlayTargetSentence({
  target,
  draft,
  committed,
  variant = 'panel',
  className = '',
}: Props) {
  const display = draft.length >= committed.length ? draft : committed
  const isStage = variant === 'stage'

  const shellCls = isStage
    ? 'rounded-lg bg-black/78 px-2.5 py-2 shadow-lg ring-1 ring-white/25 backdrop-blur-sm sm:px-3'
    : 'rounded-xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm'

  const textCls = isStage
    ? 'text-center text-[clamp(0.82rem,3.4vw,1.15rem)] font-bold leading-relaxed tracking-tight text-white'
    : 'text-center text-[clamp(0.9rem,4vw,1.2rem)] font-bold leading-relaxed tracking-tight text-stone-900'

  return (
    <div className={`play-target-sentence relative z-20 ${shellCls} ${className}`}>
      <p className={textCls} aria-label="따라 쓸 문장">
        {target.split('').map((ch, i) => {
          const typedCh = display[i]
          let cls = isStage ? 'text-white/35' : 'text-stone-300'
          if (typedCh !== undefined) {
            cls = typedCh === ch ? (isStage ? 'text-amber-200' : 'text-stone-900') : 'text-red-500'
          } else if (i === display.length) {
            cls = isStage
              ? 'text-white underline decoration-amber-400 decoration-2 underline-offset-[0.2em]'
              : 'text-stone-500 underline decoration-amber-600 decoration-2 underline-offset-[0.2em]'
          }
          return (
            <span
              key={`${i}-${ch}`}
              className={cls}
              style={isStage ? { textShadow: '0 1px 5px rgba(0,0,0,0.85)' } : undefined}
            >
              {ch}
            </span>
          )
        })}
      </p>
    </div>
  )
}
