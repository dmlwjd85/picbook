import type { VocabGloss } from '../types/pack'
import { KaraokeLyrics, KaraokeLyricsBottom } from './KaraokeLyrics'

type KaraokeProps = {
  target: string
  draft: string
  committed: string
}

type Props = {
  glosses: VocabGloss[]
  karaoke: KaraokeProps | null
  showKaraoke: boolean
}

/** 연출창 최상단: 낱말 풀이 → 따라 쓸 문장(모바일, 풀이 아래) */
export function StageTopOverlays({ glosses, karaoke, showKaraoke }: Props) {
  const hasGloss = glosses.length > 0

  return (
    <>
      {hasGloss ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[35] flex flex-col gap-1 px-2 pt-1.5 sm:px-3">
          {glosses.map((g) => (
            <div
              key={`${g.charIndex}-${g.term}`}
              className="mx-auto w-full max-w-[96%] rounded-lg border border-amber-300/50 bg-black/82 px-2.5 py-1 shadow-lg backdrop-blur-sm"
            >
              <p className="text-center text-[clamp(0.7rem,1.7vw,0.88rem)] font-bold leading-snug text-amber-50">
                <span className="text-amber-300">{g.term}</span>
                <span className="text-white/60"> · </span>
                <span className="font-medium text-white">{g.definition}</span>
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {showKaraoke && karaoke ? (
        <>
          <KaraokeLyrics
            target={karaoke.target}
            draft={karaoke.draft}
            committed={karaoke.committed}
            glossOffset={hasGloss}
          />
          <KaraokeLyricsBottom
            target={karaoke.target}
            draft={karaoke.draft}
            committed={karaoke.committed}
          />
        </>
      ) : null}
    </>
  )
}
