type Props = {

  target: string

  draft: string

  committed: string

}



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



type KaraokeLyricsProps = Props & {

  embedded?: boolean

}



/** 연출 이미지 상단 — 목표 문장(카라오케) */

export function KaraokeLyrics({ target, draft, committed, embedded = false }: KaraokeLyricsProps) {

  const display = draft.length >= committed.length ? draft : committed

  const { text, baseIndex, leadEllipsis, trailEllipsis } = karaokeVisibleSlice(

    target,

    display.length,

    24,

  )



  const shellCls = embedded

    ? 'w-full'

    : 'pointer-events-none absolute inset-x-0 top-0 z-[32] px-2 pt-1.5 pb-1 sm:px-3 lg:pt-2'



  return (

    <div className={shellCls}>

      <div className="mx-auto max-w-[94%] rounded-lg bg-black/55 px-2 py-1 backdrop-blur-[3px] sm:px-3 sm:py-1.5">

        <div className="flex items-end justify-center gap-0.5 sm:gap-1">

          {leadEllipsis ? (

            <span className="shrink-0 pb-0.5 text-sm font-bold text-white/50" aria-hidden>

              …

            </span>

          ) : null}

          <KaraokeChars

            target={text}

            display={display}

            baseIndex={baseIndex}

            className="min-w-0 text-center text-[clamp(0.8rem,3.2vw,1.2rem)] font-bold leading-snug tracking-tight whitespace-nowrap lg:text-[clamp(0.95rem,1.6vw,1.25rem)]"

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



export function KaraokeLyricsBottom(props: Props) {

  return <KaraokeLyrics {...props} />

}


