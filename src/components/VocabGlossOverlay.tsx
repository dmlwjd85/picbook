import type { VocabGloss } from '../types/pack'

type Props = {
  glosses: VocabGloss[]
}

/** 연출 상단 — 어려운 낱말 풀이 (네이버 어학사전 참고) */
export function VocabGlossOverlay({ glosses }: Props) {
  if (glosses.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-25 flex flex-col gap-1.5 px-2 pt-2 sm:px-3 sm:pt-3">
      {glosses.map((g) => (
        <div
          key={`${g.charIndex}-${g.term}`}
          className="mx-auto max-w-[96%] rounded-lg border border-amber-200/40 bg-black/75 px-3 py-1.5 text-center shadow-lg backdrop-blur-sm"
        >
          <p className="text-[clamp(0.75rem,1.8vw,0.95rem)] font-bold leading-snug text-amber-100">
            <span className="text-amber-300">{g.term}</span>
            <span className="text-white/70"> · </span>
            <span className="font-medium text-white">{g.definition}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
