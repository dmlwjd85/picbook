import type { VocabGloss } from '../types/pack'
import { KaraokeLyrics, KaraokeLyricsBottom } from './KaraokeLyrics'
import { VocabGlossBottom } from './VocabGlossBottom'

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

/** 연출 내부 오버레이 — 모바일: 아래 자막·낱말 / 웹: 위 낱말·아래 자막 */
export function StageInlays({ glosses, karaoke, showKaraoke }: Props) {
  const hasGloss = glosses.length > 0

  return (
    <>
      {hasGloss ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[35] hidden flex-col gap-1 px-3 pt-2 lg:flex">
          {glosses.map((g) => (
            <div
              key={`${g.charIndex}-${g.term}`}
              className="mx-auto w-full max-w-[96%] rounded-md bg-black/55 px-3 py-1 backdrop-blur-[3px]"
            >
              <p className="text-center text-[clamp(0.75rem,1.8vw,0.95rem)] font-bold leading-snug text-amber-50">
                <span className="text-amber-300">{g.term}</span>
                <span className="text-white/60"> · </span>
                <span className="font-medium text-white">{g.definition}</span>
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <VocabGlossBottom glosses={glosses} karaokeActive={showKaraoke} />

      {showKaraoke && karaoke ? (
        <>
          <KaraokeLyrics
            target={karaoke.target}
            draft={karaoke.draft}
            committed={karaoke.committed}
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
