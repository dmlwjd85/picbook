import type { VocabGloss } from '../types/pack'
import { KaraokeLyrics } from './KaraokeLyrics'
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

/** 연출 상단 — 목표 문장, 바로 아래 낱말 풀이 */
export function StageInlays({ glosses, karaoke, showKaraoke }: Props) {
  if (!showKaraoke && glosses.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[32] flex flex-col gap-0.5 px-2 pt-1.5 sm:px-3 lg:pt-2">
      {showKaraoke && karaoke ? (
        <KaraokeLyrics
          target={karaoke.target}
          draft={karaoke.draft}
          committed={karaoke.committed}
          embedded
        />
      ) : null}
      <VocabGlossBottom glosses={glosses} embedded />
    </div>
  )
}
