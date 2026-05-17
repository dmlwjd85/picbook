type Props = {
  text: string
  /** 모바일 전체 화면 교훈 */
  large?: boolean
}

/** 마지막 장면 — 캐릭터 위 말풍선 교훈 대사 */
export function ClosingSpeechBubble({ text, large = false }: Props) {
  return (
    <div
      className={`pointer-events-none absolute z-40 left-1/2 -translate-x-1/2 ${
        large
          ? 'top-[clamp(0.5rem,6vh,2.75rem)] w-[min(92%,24rem)]'
          : 'top-[8%] w-[min(88%,20rem)]'
      }`}
    >
      <div className="relative rounded-2xl rounded-bl-sm bg-white/[0.97] px-4 py-3 shadow-[0_10px_36px_rgba(0,0,0,0.4)] ring-1 ring-black/10 backdrop-blur-[2px]">
        <p
          className={`text-center font-bold leading-snug text-stone-900 ${
            large
              ? 'text-[clamp(1rem,4.2vw,1.35rem)]'
              : 'text-[clamp(0.9rem,2.8vw,1.15rem)]'
          }`}
        >
          {text}
        </p>
        <span
          className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white/[0.97] shadow-sm ring-1 ring-black/5"
          aria-hidden
        />
      </div>
    </div>
  )
}
