type Props = {
  target: string
  draft: string
  committed: string
}

/** 모바일 — 연출 이미지 최상단: 타이핑 진행 문장 */
export function KaraokeLyrics({ target, draft, committed }: Props) {
  const display = draft.length >= committed.length ? draft : committed

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[32] px-2 pt-1.5 max-lg:block lg:hidden"
      style={{
        background:
          'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)',
      }}
    >
      <p className="mx-auto max-w-[96%] pb-2 text-center text-[clamp(0.9rem,2.2vw,1.15rem)] font-bold leading-snug tracking-tight">
        {target.split('').map((ch, i) => {
          const typedCh = display[i]
          let cls = 'text-white/30'
          if (typedCh !== undefined) {
            cls = typedCh === ch ? 'text-amber-200' : 'text-red-400'
          } else if (i === display.length) {
            cls = 'text-white underline decoration-amber-400 decoration-2 underline-offset-4'
          }
          return (
            <span key={`${i}-${ch}`} className={cls} style={{ textShadow: '0 1px 3px #000' }}>
              {ch}
            </span>
          )
        })}
      </p>
    </div>
  )
}

/** 웹 — 연출 하단: 타이핑 진행 문장 */
export function KaraokeLyricsBottom({ target, draft, committed }: Props) {
  const display = draft.length >= committed.length ? draft : committed

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[32] hidden px-4 pb-[5%] pt-20 lg:block"
      style={{
        background:
          'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
      }}
    >
      <p className="mx-auto max-w-[96%] text-center text-[clamp(1rem,2.4vw,1.45rem)] font-bold leading-snug tracking-tight">
        {target.split('').map((ch, i) => {
          const typedCh = display[i]
          let cls = 'text-white/30'
          if (typedCh !== undefined) {
            cls = typedCh === ch ? 'text-amber-200' : 'text-red-400'
          } else if (i === display.length) {
            cls = 'text-white underline decoration-amber-400 decoration-2 underline-offset-4'
          }
          return (
            <span key={`${i}-${ch}`} className={cls} style={{ textShadow: '0 1px 3px #000' }}>
              {ch}
            </span>
          )
        })}
      </p>
    </div>
  )
}
