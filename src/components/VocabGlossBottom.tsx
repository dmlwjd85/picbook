import type { VocabGloss } from '../types/pack'

type Props = {
  glosses: VocabGloss[]
}

/** 모바일 연출 하단 — 낱말 풀이 */
export function VocabGlossBottom({ glosses }: Props) {
  if (glosses.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[35] flex flex-col gap-1 px-2 pb-2 pt-10 max-lg:flex lg:hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)',
        }}
      />
      {glosses.map((g) => (
        <div
          key={`${g.charIndex}-${g.term}`}
          className="relative mx-auto w-full max-w-[96%] rounded-lg border border-amber-300/50 bg-black/82 px-2.5 py-1 shadow-lg backdrop-blur-sm"
        >
          <p className="text-center text-[clamp(0.7rem,1.7vw,0.88rem)] font-bold leading-snug text-amber-50">
            <span className="text-amber-300">{g.term}</span>
            <span className="text-white/60"> · </span>
            <span className="font-medium text-white">{g.definition}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
