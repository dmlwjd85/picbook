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

/** 연출 내부 오버레이 — 낱말 풀이는 자막 바로 위, 카라오케는 하단 */
export function StageInlays({ glosses, karaoke, showKaraoke }: Props) {
  return (
    <>
      <VocabGlossBottom glosses={glosses} karaokeActive={showKaraoke} />

      {showKaraoke && karaoke ? (
        <KaraokeLyrics
          target={karaoke.target}
          draft={karaoke.draft}
          committed={karaoke.committed}
        />
      ) : null}
    </>
  )
}
