type Props = {
  target: string
  draft: string
  committed: string
}

/** 긴 문장은 타이핑 위치 근처만 보이게 잘라 연출 하단이 과하게 길어지지 않게 함 */
function karaokeVisibleSlice(target: string, caret: number, maxChars = 22) {
  if (target.length <= maxChars) {
    return { text: target, baseIndex: 0, leadEllipsis: false, trailEllipsis: false }
  }
  const safeCaret = Math.min(Math.max(caret, 0), target.length)
  let start = Math.max(0, safeCaret - Math.floor(maxChars * 0.45))
  if (start + maxChars > target.length) start = target.length - maxChars
  return {
    text: target.slice(start, start + maxChars),
    baseIndex: start,
    leadEllipsis: start > 0,
    trailEllipsis: start + maxChars < target.length,
  }
}

function KaraokeChars({
  target,
  display,
  baseIndex,
  className,
}: {
  target: string
  display: string
  baseIndex: number
  className?: string
}) {
  return (
    <p className={className}>
      {target.split('').map((ch, i) => {
        const globalIndex = baseIndex + i
        const typedCh = display[globalIndex]
        let cls = 'text-white/30'
        if (typedCh !== undefined) {
          cls = typedCh === ch ? 'text-amber-200' : 'text-red-400'
        } else if (globalIndex === display.length) {
          cls = 'text-white underline decoration-amber-400 decoration-2 underline-offset-4'
        }
        return (
          <span key={`${globalIndex}-${ch}`} className={cls} style={{ textShadow: '0 1px 4px #000' }}>
            {ch}
          </span>
        )
      })}
    </p>
  )
}

/** 모바일 — 연출 이미지 하단 겹침: 타이핑 진행 */
export function KaraokeLyrics({ target, draft, committed }: Props) {
  const display = draft.length >= committed.length ? draft : committed
  const { text, baseIndex, leadEllipsis, trailEllipsis } = karaokeVisibleSlice(
    target,
    display.length,
    20,
  )

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[32] px-2 pb-1 pt-6 max-lg:block lg:hidden">
      <div className="mx-auto max-w-[94%] rounded-lg bg-black/55 px-2 py-1 backdrop-blur-[3px]">
        <div className="flex items-end justify-center gap-0.5">
          {leadEllipsis ? (
            <span className="shrink-0 pb-0.5 text-sm font-bold text-white/50" aria-hidden>
              …
            </span>
          ) : null}
          <KaraokeChars
            target={text}
            display={display}
            baseIndex={baseIndex}
            className="min-w-0 text-center text-[clamp(0.8rem,3.6vw,1rem)] font-bold leading-snug tracking-tight whitespace-nowrap"
          />
          {trailEllipsis ? (
            <span className="shrink-0 pb-0.5 text-sm font-bold text-white/50" aria-hidden>
              …
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** 웹 — 연출 하단 겹침: 타이핑 진행 */
export function KaraokeLyricsBottom({ target, draft, committed }: Props) {
  const display = draft.length >= committed.length ? draft : committed
  const { text, baseIndex, leadEllipsis, trailEllipsis } = karaokeVisibleSlice(
    target,
    display.length,
    28,
  )

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[32] hidden px-3 pb-2 pt-8 lg:block">
      <div className="mx-auto max-w-[94%] rounded-lg bg-black/50 px-3 py-1.5 backdrop-blur-[3px]">
        <div className="flex items-end justify-center gap-1">
          {leadEllipsis ? (
            <span className="shrink-0 pb-1 text-base font-bold text-white/50" aria-hidden>
              …
            </span>
          ) : null}
          <KaraokeChars
            target={text}
            display={display}
            baseIndex={baseIndex}
            className="min-w-0 text-center text-[clamp(0.95rem,2.2vw,1.35rem)] font-bold leading-snug tracking-tight whitespace-nowrap"
          />
          {trailEllipsis ? (
            <span className="shrink-0 pb-1 text-base font-bold text-white/50" aria-hidden>
              …
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
