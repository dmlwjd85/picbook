import { useEffect, useRef, useState } from 'react'
import { TypingStatsBar } from './TypingStatsBar'
import { playbackTypedPrefix, syncTypingFromRaw } from '../lib/typingMatch'
import type { TypingStatsSnapshot } from '../lib/typingStats'

type Props = {
  target: string
  typed: string
  onTypedChange: (next: string) => void
  onDraftChange?: (draft: string) => void
  disabled?: boolean
  minimal?: boolean
  /** PlayPage에서 넘긴 통계(정확도는 제출 후) */
  typingStats?: TypingStatsSnapshot | null
}

/**
 * 목표 문장의 앞부분과 일치하는 입력만 반영합니다.
 * 한글 IME 조합 중에는 글자만 보여 주고, 조합이 끝나면 올바른 앞부분으로 맞춥니다.
 */
export function TypingPanel({
  target,
  typed,
  onTypedChange,
  onDraftChange,
  disabled,
  minimal = false,
  typingStats = null,
}: Props) {
  const [draft, setDraft] = useState(typed)
  const composingRef = useRef(false)

  useEffect(() => {
    if (composingRef.current) return
    setDraft((prev) => {
      if (prev.length > typed.length && playbackTypedPrefix(prev, target).length > typed.length) {
        return prev
      }
      if (typed.length >= prev.length) return typed
      if (playbackTypedPrefix(prev, target) === typed) return typed
      return prev
    })
  }, [typed, target])

  const setDraftAndNotify = (raw: string) => {
    setDraft(raw)
    onDraftChange?.(raw)
  }

  const commitRaw = (raw: string) => {
    if (composingRef.current) return
    syncTypingFromRaw(raw, target, typed, onTypedChange)
  }

  const flushCommit = (el: HTMLTextAreaElement) => {
    const apply = () => commitRaw(el.value)
    apply()
    requestAnimationFrame(apply)
  }

  return (
    <div className="space-y-2">
      {!minimal ? <label className="block text-xs font-medium text-slate-500">타이핑</label> : null}
      <textarea
        rows={minimal ? 2 : 3}
        disabled={disabled}
        value={draft}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        inputMode="text"
        lang="ko"
        className={`w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 leading-relaxed text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 ${
          minimal ? 'text-center text-2xl font-bold' : 'text-lg'
        }`}
        onCompositionStart={() => {
          composingRef.current = true
        }}
        onCompositionUpdate={() => {
          composingRef.current = true
        }}
        onCompositionEnd={(e) => {
          composingRef.current = false
          const raw = e.currentTarget.value
          setDraftAndNotify(raw)
          flushCommit(e.currentTarget)
        }}
        onChange={(e) => {
          if (disabled) return
          const raw = e.target.value
          setDraftAndNotify(raw)
          const isComposing =
            composingRef.current ||
            (e.nativeEvent as InputEvent).isComposing === true
          if (!isComposing) commitRaw(raw)
        }}
      />
      {typingStats ? <TypingStatsBar stats={typingStats} className="mt-1" /> : null}
      <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
        {minimal ? (
          typed === target && target.length > 0 ? (
            <span className="text-emerald-600">다음 장면 →</span>
          ) : typed.length > 0 ? (
            <span className="text-amber-600">「{target[typed.length] ?? ''}」</span>
          ) : (
            <span>따라 써요</span>
          )
        ) : (
          <>
            <span>
              진행 {typed.length} / {target.length} 글자
            </span>
            {typed.length > 0 && typed === target.slice(0, typed.length) ? (
              <span className="text-emerald-600">문장과 일치</span>
            ) : typed.length > 0 ? (
              <span className="text-amber-600">다음: 「{target[typed.length] ?? ''}」</span>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
