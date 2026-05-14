type Props = {
  target: string
  typed: string
  onTypedChange: (next: string) => void
  disabled?: boolean
}

/**
 * 선두 일치만 허용하는 타자 입력(백스페이스는 자유).
 */
export function TypingPanel({ target, typed, onTypedChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-500">타이핑</label>
      <textarea
        rows={3}
        disabled={disabled}
        value={typed}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg leading-relaxed text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
        onChange={(e) => {
          const next = e.target.value
          if (disabled) return
          if (next.length < typed.length) {
            onTypedChange(next)
            return
          }
          if (next.length === typed.length + 1) {
            const ch = next[next.length - 1]
            if (ch === target[typed.length]) onTypedChange(next)
          }
        }}
      />
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span>
          진행 {typed.length} / {target.length} 글자
        </span>
        {typed.length > 0 && typed === target.slice(0, typed.length) ? (
          <span className="text-emerald-600">선두 일치</span>
        ) : typed.length > 0 ? (
          <span className="text-amber-600">다음 글자: 「{target[typed.length] ?? ''}」</span>
        ) : null}
      </div>
    </div>
  )
}
