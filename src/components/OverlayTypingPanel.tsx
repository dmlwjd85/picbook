import { useEffect, useRef, useState, type ChangeEvent } from 'react'

type Props = {
  target: string
  typed: string
  onTypedChange: (next: string) => void
  disabled?: boolean
}

function longestMatchingPrefix(input: string, target: string): string {
  let i = 0
  const limit = Math.min(input.length, target.length)
  while (i < limit && input[i] === target[i]) i += 1
  return target.slice(0, i)
}

const TEXT =
  'whitespace-pre-wrap break-words px-4 py-3 text-lg leading-relaxed sm:text-xl'

/**
 * 모바일: 흐릿한 목표 문장 위에 타이핑 입력을 겹쳐 표시.
 */
export function OverlayTypingPanel({ target, typed, onTypedChange, disabled }: Props) {
  const [draft, setDraft] = useState(typed)
  const composingRef = useRef(false)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!composingRef.current) setDraft(typed)
  }, [typed])

  const applyValue = (raw: string) => {
    const v = longestMatchingPrefix(raw, target)
    setDraft(v)
    if (v !== typed) onTypedChange(v)
  }

  const onDigit = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return
    const next = e.target.value
    if (composingRef.current) {
      setDraft(next)
      return
    }
    applyValue(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative min-h-[7.5rem] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-inner">
        {/* 흐릿한 제시 문장 */}
        <p
          className={`pointer-events-none absolute inset-0 z-0 ${TEXT} text-stone-400/90`}
          style={{ filter: 'blur(0.4px)', opacity: 0.42 }}
          aria-hidden
        >
          {target || ' '}
        </p>

        <textarea
          ref={areaRef}
          rows={4}
          disabled={disabled}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          inputMode="text"
          lang="ko"
          className={`relative z-[1] min-h-[7.5rem] w-full resize-none border-0 bg-transparent ${TEXT} text-stone-900 caret-amber-700 focus:outline-none focus:ring-0 disabled:opacity-50`}
          onCompositionStart={() => {
            composingRef.current = true
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false
            applyValue(e.currentTarget.value)
          }}
          onChange={onDigit}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 text-xs text-stone-500">
        <span>
          {typed.length} / {target.length} 글자
        </span>
        {typed.length > 0 && typed !== target.slice(0, typed.length) ? (
          <span className="font-medium text-amber-700">다음 「{target[typed.length] ?? ''}」</span>
        ) : typed.length > 0 ? (
          <span className="font-medium text-emerald-600">일치</span>
        ) : (
          <span className="text-stone-400">위 문장을 따라 입력</span>
        )}
      </div>
    </div>
  )
}
