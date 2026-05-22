import { useEffect, useRef } from 'react'

type Props = {
  target: string
  draft: string
  committed: string
  /** 연출 위(밝은 글자) / 입력 패널(어두운 글자) */
  variant?: 'stage' | 'panel'
  className?: string
}

/** 따라 쓸 목표 문장 — 연출 상단, 배경 없이 한 줄 가로 스크롤 */
export function PlayTargetSentence({
  target,
  draft,
  committed,
  variant = 'panel',
  className = '',
}: Props) {
  const display = draft.length >= committed.length ? draft : committed
  const isStage = variant === 'stage'
  const scrollRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!isStage || !scrollRef.current || !caretRef.current) return
    const row = scrollRef.current
    const caret = caretRef.current
    const pad = 12
    const caretLeft = caret.offsetLeft
    const caretRight = caretLeft + caret.offsetWidth
    if (caretLeft < row.scrollLeft + pad) {
      row.scrollLeft = Math.max(0, caretLeft - pad)
    } else if (caretRight > row.scrollLeft + row.clientWidth - pad) {
      row.scrollLeft = caretRight - row.clientWidth + pad
    }
  }, [display.length, isStage, target])

  const textCls = isStage
    ? 'whitespace-nowrap text-[clamp(0.82rem,3.4vw,1.12rem)] font-bold leading-none tracking-tight'
    : 'text-center text-[clamp(0.9rem,4vw,1.2rem)] font-bold leading-relaxed tracking-tight text-stone-900'

  const chars = (
    <p className={textCls} aria-label="따라 쓸 문장">
      {target.split('').map((ch, i) => {
        const typedCh = display[i]
        let cls = isStage ? 'text-white/40' : 'text-stone-300'
        if (typedCh !== undefined) {
          cls = typedCh === ch ? (isStage ? 'text-amber-100' : 'text-stone-900') : 'text-red-400'
        } else if (i === display.length) {
          cls = isStage
            ? 'text-white underline decoration-amber-300 decoration-2 underline-offset-[0.22em]'
            : 'text-stone-500 underline decoration-amber-600 decoration-2 underline-offset-[0.2em]'
        }
        const isCaret = i === display.length
        return (
          <span
            key={`${i}-${ch}`}
            ref={isCaret ? caretRef : undefined}
            className={cls}
            style={
              isStage
                ? {
                    textShadow:
                      '0 0 10px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)',
                  }
                : undefined
            }
          >
            {ch}
          </span>
        )
      })}
    </p>
  )

  if (!isStage) {
    return (
      <div className={`play-target-sentence relative z-20 rounded-xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm ${className}`}>
        {chars}
      </div>
    )
  }

  return (
    <div
      className={`play-target-sentence play-target-sentence--stage pointer-events-none w-full ${className}`}
    >
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="inline-flex min-w-full justify-start px-1 py-0.5">{chars}</div>
      </div>
    </div>
  )
}
