import { useEffect, useMemo, useState } from 'react'

const base = import.meta.env.BASE_URL

const DEMO_FRAMES = [
  `${base}demo/proverbs/proverbs-kind-words-01.png`,
  `${base}demo/proverbs/proverbs-whale-shrimp-02.png`,
  `${base}demo/proverbs/proverbs-cat-bell-03.png`,
  `${base}demo/proverbs/proverbs-crow-fly-belly-04.png`,
] as const

const DEMO_TEXT = '고래 싸움에 새우 등 터진다.'

/** 로그인·랜딩 — 타자하면 그림이 완성되는 느낌의 짧은 데모 */
export function TypingDemoShowcase({ className = '' }: { className?: string }) {
  const [typedLen, setTypedLen] = useState(0)
  useEffect(() => {
    const tick = window.setInterval(() => {
      setTypedLen((n) => {
        if (n >= DEMO_TEXT.length) {
          window.setTimeout(() => setTypedLen(0), 900)
          return n
        }
        return n + 1
      })
    }, 220)
    return () => window.clearInterval(tick)
  }, [])

  const imageIndex = useMemo(
    () =>
      typedLen === 0
        ? 0
        : Math.min(DEMO_FRAMES.length - 1, Math.ceil((typedLen / DEMO_TEXT.length) * DEMO_FRAMES.length) - 1),
    [typedLen],
  )

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-b from-stone-900 to-stone-950 shadow-xl shadow-amber-950/25 ${className}`}
    >
      <div className="relative aspect-[3/2] w-full">
        {DEMO_FRAMES.map((url, i) => (
          <img
            key={url}
            src={url}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === imageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            draggable={false}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
        <p className="pointer-events-none absolute left-0 right-0 top-3 text-center text-[11px] font-bold tracking-wide text-amber-100/90">
          타자를 치면 그림책이 완성됩니다
        </p>
        <p className="pointer-events-none absolute inset-x-0 bottom-3 px-3 text-center font-display text-[clamp(0.95rem,3.8vw,1.15rem)] font-bold leading-snug">
          {DEMO_TEXT.split('').map((ch, i) => {
            let cls = 'text-white/35'
            if (i < typedLen) cls = 'text-amber-200'
            else if (i === typedLen) cls = 'text-white underline decoration-amber-400 decoration-2 underline-offset-4'
            return (
              <span key={`${i}-${ch}`} className={cls} style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                {ch}
              </span>
            )
          })}
        </p>
      </div>
      <p className="border-t border-amber-900/40 bg-amber-950/40 px-4 py-2.5 text-center text-xs leading-relaxed text-amber-100/85">
        <span className="font-semibold text-amber-50">백문이 불여일견</span>
        <span className="text-amber-200/70"> — 직접 쳐 보면 장면이 바뀌는 타자 독서 팩</span>
      </p>
    </div>
  )
}
