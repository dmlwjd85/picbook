import { useEffect, useMemo, useRef, useState } from 'react'
import { draftHasBlockingTypo, playbackTypedPrefix, syncTypingFromRaw } from '../lib/typingMatch'

type Props = {
  target: string
  typed: string
  onTypedChange: (next: string) => void
  onDraftChange?: (draft: string) => void
  disabled?: boolean
  className?: string
  /** 문장은 그림 하단 자막만 — 입력창만 표시 */
  karaokeOnly?: boolean
  /** 연출 위 투명 입력(몰입 모드) */
  immersive?: boolean
  /** 바뀔 때마다 입력창에 포커스 */
  focusToken?: number
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
  immersive = false,
  focusToken = 0,
}: Props) {
  const [draft, setDraft] = useState(typed)
  const composingRef = useRef(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const hasTypo = useMemo(() => draftHasBlockingTypo(draft, target), [draft, target])

  /** typed 동기화 — 조합 꼬리(고ㄹ)를 typed가 따라잡기 전에 지우지 않음 */
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

  useEffect(() => {
    onDraftChange?.(draft)
  }, [draft, onDraftChange])

  useEffect(() => {
    if (disabled) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [focusToken, disabled, target])

  const commit = (raw: string) => {
    if (disabled || composingRef.current) return
    syncTypingFromRaw(raw, target, typed, onTypedChange)
  }

  const flushCommit = (el: HTMLTextAreaElement) => {
    const apply = () => commit(el.value)
    apply()
    requestAnimationFrame(apply)
  }

  const setDraftAndNotify = (raw: string) => {
    setDraft(raw)
    onDraftChange?.(raw)
  }

  if (karaokeOnly) {
    const wrapCls = immersive
      ? `play-typing-immersive relative ${hasTypo ? 'play-typing-typo' : ''} ${className}`
      : `relative ${hasTypo ? 'play-typing-typo' : ''} ${className}`
    const fieldCls = immersive
      ? 'play-typing-field-immersive w-full resize-none border-0 bg-transparent px-2 py-3 text-center font-display text-[clamp(1.15rem,5vw,1.65rem)] font-bold leading-snug text-white/95 caret-amber-300 placeholder:text-white/40 focus:outline-none focus:ring-0 disabled:opacity-50'
      : 'w-full resize-none rounded-xl border border-stone-200/80 bg-stone-50/90 px-3 py-2.5 text-center font-display text-base font-semibold text-stone-800 caret-amber-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:opacity-50'

    return (
      <div className={wrapCls}>
        <textarea
          ref={inputRef}
          rows={immersive ? 2 : 1}
          disabled={disabled}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          inputMode="text"
          lang="ko"
          placeholder={immersive ? '여기에 따라 써 보세요' : '따라 써보세요.'}
          aria-label="따라 쓰기"
          className={fieldCls}
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
            const raw = e.target.value
            setDraftAndNotify(raw)
            const isComposing =
              composingRef.current ||
              (e.nativeEvent as InputEvent).isComposing === true
            if (!isComposing) commit(raw)
          }}
        />
      </div>
    )
  }

  const displayLen = Math.max(target.length, draft.length)

  return (
    <div className={`flex flex-col ${hasTypo ? 'play-typing-typo' : ''} ${className}`}>
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
                <span key={`extra-${i}`} className="text-amber-700">
                  {typedCh}
                </span>
              )
            }
            let cls = 'text-stone-300'
            if (typedCh !== undefined) {
              cls = typedCh === targetCh ? 'text-stone-900' : 'text-amber-700'
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
            const raw = e.target.value
            setDraftAndNotify(raw)
            const isComposing =
              composingRef.current ||
              (e.nativeEvent as InputEvent).isComposing === true
            if (!isComposing) commit(raw)
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
