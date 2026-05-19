import { useEffect, useRef } from 'react'
import { mergeFrameEditsUpTo } from '../lib/mergeFrameEdits'
import { getTimelineAudioObjectUrl } from '../lib/timelineMediaDb'
import type { SentenceTimeline } from '../types/timeline'

/** 글자 프레임 진입 시 효과음·BGM 재생 */
export function useTimelineFrameAudio(
  timeline: SentenceTimeline | null,
  charIndex: number,
  enabled: boolean,
) {
  const prevIndex = useRef(-1)
  const bgmRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!enabled || !timeline) return

    if (timeline.bgm) {
      void (async () => {
        let src: string | null = timeline.bgm?.url ?? null
        if (timeline.bgm?.customAudioId) {
          src = (await getTimelineAudioObjectUrl(timeline.bgm.customAudioId)) ?? src
        }
        if (!src) return
        if (!bgmRef.current) {
          bgmRef.current = new Audio()
          bgmRef.current.loop = timeline.bgm?.loop ?? true
        }
        const a = bgmRef.current
        if (a.src !== src) {
          a.src = src
          a.volume = Math.max(0, Math.min(1, timeline.bgm?.volume ?? 0.35))
          void a.play().catch(() => {})
        }
      })()
    }

    return () => {
      bgmRef.current?.pause()
      bgmRef.current = null
    }
  }, [enabled, timeline?.bgm?.url, timeline?.bgm?.customAudioId, timeline?.bgm?.volume, timeline?.bgm?.loop])

  useEffect(() => {
    if (!enabled || !timeline) {
      prevIndex.current = charIndex
      return
    }

    if (charIndex <= prevIndex.current) {
      prevIndex.current = charIndex
      return
    }

    const merged = mergeFrameEditsUpTo(timeline, charIndex)
    const sfx = merged.sfx
    if (sfx) {
      void (async () => {
        let src = sfx.url ?? null
        if (sfx.customAudioId) {
          src = (await getTimelineAudioObjectUrl(sfx.customAudioId)) ?? src
        }
        if (!src) return
        const a = new Audio(src)
        a.volume = Math.max(0, Math.min(1, sfx.volume ?? 0.85))
        void a.play().catch(() => {})
      })()
    }

    prevIndex.current = charIndex
  }, [charIndex, enabled, timeline])
}
