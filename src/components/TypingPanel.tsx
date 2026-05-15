import { useEffect, useRef, useState } from 'react'
import { syncTypingFromRaw } from '../lib/typingMatch'

type Props = {
  target: string
  typed: string
  onTypedChange: (next: string) => void
  disabled?: boolean
}

/**
 * 목표 문장의 앞부분과 일치하는 입력만 반영합니다.
 * 한글 IME 조합 중에는 글자만 보여 주고, 조합이 끝나면 올바른 앞부분으로 맞춥니다.
 */
export function TypingPanel({ target, typed, onTypedChange, disabled }: Props) {
  const [draft, setDraft] = useState(typed)
  const composingRef = useRef(false)

  useEffect(() => {
    if (!composingRef.current) setDraft(typed)
  }, [typed])

  const pushRaw = (raw: string) => {
    setDraft(raw)
    syncTypingFromRaw(raw, target, typed, onTypedChange)
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-500">타이핑</label>
      <textarea
        rows={3}
        disabled={disabled}
        value={draft}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        inputMode="text"
        lang="ko"
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg leading-relaxed text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        onCompositionStart={() => {
          composingRef.current = true
        }}
        onCompositionEnd={(e) => {
          composingRef.current = false
          pushRaw(e.currentTarget.value)
        }}
        onChange={(e) => {
          if (disabled) return
          pushRaw(e.target.value)
        }}
      />
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span>
          진행 {typed.length} / {target.length} 글자
        </span>
        {typed.length > 0 && typed === target.slice(0, typed.length) ? (
          <span className="text-emerald-600">문장과 일치</span>
        ) : typed.length > 0 ? (
          <span className="text-amber-600">다음: 「{target[typed.length] ?? ''}」</span>
        ) : null}
      </div>
    </div>
  )
}
