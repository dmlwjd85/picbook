import type { CharFrameEdit, SentenceTimeline, TimelineInsert } from '../types/timeline'

/** 0..charIndex까지 프레임 편집을 누적 병합 */
export function mergeFrameEditsUpTo(timeline: SentenceTimeline, charIndex: number): CharFrameEdit {
  let merged: CharFrameEdit = {}
  for (let i = 0; i <= charIndex; i++) {
    const e = timeline.frameEdits[i]
    if (e) merged = { ...merged, ...e }
  }
  return merged
}

/** 현재 글자 수에서 활성인 삽입 컷(가장 최근 afterCharIndex) */
export function activeInsert(timeline: SentenceTimeline, typedLength: number): TimelineInsert | null {
  let best: TimelineInsert | null = null
  for (const ins of timeline.inserts) {
    if (typedLength > ins.afterCharIndex) {
      if (!best || ins.afterCharIndex >= best.afterCharIndex) {
        best = ins
      }
    }
  }
  return best
}
