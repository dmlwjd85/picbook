import { useEffect, useRef, useState } from 'react'
import { longestMatchingPrefix } from '../lib/typingMatch'

type Props = {
  target: string
  typed: string
  onTypedChange: (next: string) => void
  disabled?: boolean
  className?: string
}

/** 연출 아래 따라 쓰기 — 오타 빨간색, IME 조합 중 연출 고정, 입력 내용 실시간 표시 */
export function TypingInline({ target, typed, onTypedChange, disabled, className = '' }: Props) {
  const [draft, setDraft] = useState(typed)
  const composingRef = useRef(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!composingRef.current) setDraft(typed)
  }, [typed])

  const commit = (raw: string) => {
    if (disabled) return
    const matched = longestMatchingPrefix(raw, target)
    if (matched !== typed) onTypedChange(matched)
  }

  const displayLen = Math.max(target.length, draft.length)

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative min-h-[3.5rem] shrink-0">
        <div
          aria-hidden
          className="pointer-events-none select-none break-all px-3 py-3 text-center text-xl font-bold leading-relaxed tracking-wide sm:text-2xl"
        >
          {Array.from({ length: displayLen }, (_, i) => {
            const targetCh = target[i]
            const typedCh = draft[i]
            if (targetCh === undefined) {
              return (
                <span key={`extra-${i}`} className="text-red-600">
                  {typedCh}
                </span>
              )
            }
            let cls = 'text-stone-300'
            if (typedCh !== undefined) {
              cls = typedCh === targetCh ? 'text-stone-900' : 'text-red-600'
            } else if (i === draft.length) {
              cls =
                'text-stone-400 underline decoration-amber-600 decoration-2 underline-offset-4'
            }
            return (
              <span key={`${i}-${targetCh}`} className={cls}>
                {targetCh}
              </span>
            )
          })}
        </div>

        <textarea
          ref={inputRef}
          rows={2}
          disabled={disabled}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          inputMode="text"
          lang="ko"
          aria-label="따라 쓰기"
          className="absolute inset-0 z-[1] h-full w-full resize-none border-0 bg-transparent text-transparent caret-amber-700 focus:outline-none focus:ring-0 disabled:opacity-50"
          onCompositionStart={() => {
            composingRef.current = true
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false
            const raw = e.currentTarget.value
            setDraft(raw)
            commit(raw)
          }}
          onChange={(e) => {
            const raw = e.target.value
            setDraft(raw)
            if (!composingRef.current) commit(raw)
          }}
        />
      </div>

      <div
        className="border-t border-stone-100 bg-amber-50/80 px-3 py-2"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-[11px] font-semibold text-amber-900/70">지금 입력 중</p>
        <p className="min-h-[1.5em] break-all text-center text-base font-bold leading-snug text-amber-950 sm:text-lg">
          {draft || '\u00a0'}
        </p>
      </div>
    </div>
  )
}
