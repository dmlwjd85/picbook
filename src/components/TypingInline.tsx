import { useEffect, useRef, useState } from 'react'
import { longestMatchingPrefix } from '../lib/typingMatch'

type Props = {
  target: string
  typed: string
  onTypedChange: (next: string) => void
  onDraftChange?: (draft: string) => void
  disabled?: boolean
  className?: string
  /** 문장은 그림 하단 자막만 — 입력창만 표시 */
  karaokeOnly?: boolean
}

/** 따라 쓰기 입력 — karaokeOnly면 연출 하단 자막과 함께 사용 */
export function TypingInline({
  target,
  typed,
  onTypedChange,
  onDraftChange,
  disabled,
  className = '',
  karaokeOnly = false,
}: Props) {
  const [draft, setDraft] = useState(typed)
  const composingRef = useRef(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!composingRef.current) setDraft(typed)
  }, [typed])

  useEffect(() => {
    onDraftChange?.(draft)
  }, [draft, onDraftChange])

  const commit = (raw: string) => {
    if (disabled) return
    const matched = longestMatchingPrefix(raw, target)
    if (matched !== typed) onTypedChange(matched)
  }

  const setDraftAndNotify = (raw: string) => {
    setDraft(raw)
    onDraftChange?.(raw)
  }

  if (karaokeOnly) {
    return (
      <div className={`relative ${className}`}>
        <textarea
          ref={inputRef}
          rows={1}
          disabled={disabled}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          inputMode="text"
          lang="ko"
          placeholder="따라 써세요…"
          aria-label="따라 쓰기"
          className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-center text-base font-semibold text-stone-800 caret-amber-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:opacity-50"
          onCompositionStart={() => {
            composingRef.current = true
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false
            const raw = e.currentTarget.value
            setDraftAndNotify(raw)
            commit(raw)
          }}
          onChange={(e) => {
            const raw = e.target.value
            setDraftAndNotify(raw)
            if (!composingRef.current) commit(raw)
          }}
        />
      </div>
    )
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
            setDraftAndNotify(raw)
            commit(raw)
          }}
          onChange={(e) => {
            const raw = e.target.value
            setDraftAndNotify(raw)
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
