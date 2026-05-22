import { useMemo } from 'react'
import { playbackTypedLength, playbackTypedPrefix } from '../lib/typingMatch'

/** 모든 픽북 연출·청크 — 조합 중 초성 일치 시 선행 반영 */
export function usePlaybackTyping(target: string, typed: string, draft: string) {
  const raw = draft.length > typed.length ? draft : typed
  const visualTyped = useMemo(() => playbackTypedPrefix(raw, target), [raw, target])
  const visualTypedLen = useMemo(
    () => playbackTypedLength(target, typed, draft),
    [target, typed, draft],
  )
  return { visualTyped, visualTypedLen, raw }
}
