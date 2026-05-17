import type { VocabGloss } from '../types/pack'

type Props = {
  glosses: VocabGloss[]
  karaokeActive?: boolean
}

/** 모바일 — 연출 안 겹침: 낱말 풀이 (자막 위) */
export function VocabGlossBottom({ glosses, karaokeActive = false }: Props) {
  if (glosses.length === 0) return null

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[35] flex flex-col gap-1 px-2 max-lg:flex lg:hidden ${
        karaokeActive ? 'bottom-[2.65rem]' : 'bottom-1'
      }`}
    >
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
