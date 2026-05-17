type Props = {
  target: string
  draft: string
  committed: string
  /** 낱말 풀이가 위에 있으면 문장을 아래로 내림 */
  glossOffset?: boolean
}

/** 노래방 자막 — 모바일: 연출 상단(풀이 아래) */
export function KaraokeLyrics({ target, draft, committed, glossOffset = false }: Props) {
  const display = draft.length >= committed.length ? draft : committed

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[32] px-2 max-lg:block lg:hidden ${
        glossOffset ? 'top-[2.85rem] sm:top-[3.1rem]' : 'top-0 pt-1'
      }`}
      style={{
        background: glossOffset
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 90%)'
          : 'linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
      }}
    >
      <p className="mx-auto max-w-[96%] pb-2 pt-0.5 text-center text-[clamp(0.9rem,2.2vw,1.15rem)] font-bold leading-snug tracking-tight">
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

/** 데스크톱용 하단 자막 */
export function KaraokeLyricsBottom({ target, draft, committed }: Omit<Props, 'glossOffset'>) {
  const display = draft.length >= committed.length ? draft : committed

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[32] hidden px-4 pb-[4%] pt-20 lg:block"
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
