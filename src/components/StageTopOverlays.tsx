import type { VocabGloss } from '../types/pack'
import { PLAY_STAGE_TEXT_Z } from '../lib/playStageZ'
import { PlayTargetSentence } from './PlayTargetSentence'
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

    <div
      className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-1 px-2 pt-1.5 sm:px-3 lg:pt-2"
      style={{ zIndex: PLAY_STAGE_TEXT_Z }}
    >
      {showKaraoke && karaoke ? (
        <PlayTargetSentence
          target={karaoke.target}
          draft={karaoke.draft}
          committed={karaoke.committed}
          variant="stage"
        />
      ) : null}

      <VocabGlossBottom glosses={glosses} embedded />

    </div>

  )

}


