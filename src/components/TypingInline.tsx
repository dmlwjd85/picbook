import { useEffect, useRef, useState } from 'react'
import { longestMatchingPrefix } from '../lib/typingMatch'

type Props = {
  target: string
  typed: string
  onTypedChange: (next: string) => void
  disabled?: boolean
  className?: string
}

/** 연출 아래 따라 쓰기 — 오타는 빨간색, IME 조합 중에는 연출 길이를 바꾸지 않음 */
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
    if (!composingRef.current) setDraft(matched)
  }

  const display = composingRef.current ? draft : typed

  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none min-h-[3.25rem] select-none break-all px-3 py-3 text-center text-xl font-bold leading-relaxed tracking-wide sm:text-2xl"
      >
        {target.split('').map((ch, i) => {
          let cls = 'text-stone-300'
          if (i < display.length) {
            cls = display[i] === ch ? 'text-stone-900' : 'text-red-600'
          } else if (i === display.length) {
            cls = 'text-stone-400 underline decoration-amber-600 decoration-2 underline-offset-4'
          }
          return (
            <span key={`${i}-${ch}`} className={cls}>
              {ch}
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
          commit(e.currentTarget.value)
        }}
        onChange={(e) => {
          const raw = e.target.value
          setDraft(raw)
          if (!composingRef.current) commit(raw)
        }}
      />
    </div>
  )
}

