import type { VocabGloss } from '../types/pack'



type Props = {

  glosses: VocabGloss[]

  /** StageTopOverlays 안에 넣을 때 absolute 제거 */

  embedded?: boolean

}



/** 연출 상단 — 목표 문장 바로 아래 낱말 풀이(간격 좁게) */

export function VocabGlossBottom({ glosses, embedded = false }: Props) {

  if (glosses.length === 0) return null



  const shellCls = embedded

    ? 'flex w-full flex-col gap-0.5'

    : 'pointer-events-none absolute inset-x-0 top-[2.35rem] z-[35] flex flex-col gap-0.5 px-2 sm:top-[2.55rem] sm:px-3 lg:top-[2.65rem]'



  return (

    <div className={shellCls}>

      {glosses.map((g) => (

        <div

          key={`${g.charIndex}-${g.term}`}

          className="mx-auto w-full max-w-[94%] rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-[3px]"

        >

          <p className="text-center text-[clamp(0.68rem,3.2vw,0.85rem)] font-bold leading-snug text-amber-50">

            <span className="text-amber-300">{g.term}</span>

            <span className="text-white/55"> · </span>

            <span className="font-medium text-white">{g.definition}</span>

          </p>

        </div>

      ))}

    </div>

  )

}


