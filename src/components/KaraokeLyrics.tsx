type Props = {
  target: string
  draft: string
  committed: string
}

/** 그림 하단 노래방 자막 — 문장은 여기만 표시 */
export function KaraokeLyrics({ target, draft, committed }: Props) {
  const display = draft.length >= committed.length ? draft : committed

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-2 pb-[4%] pt-20 sm:px-4"
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
