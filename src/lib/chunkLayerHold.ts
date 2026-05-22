import { expandEntryNeedles } from './visualDictionaryNeedles'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

function allowsIndex(entry: VisualDictionaryEntry, index: number): boolean {
  const allowed = entry.match_start_indices
  if (!allowed?.length) return true
  return allowed.includes(index)
}

/** 청크가 더 이상 해당 구간이 아니면 홀드 중단(이후 타임라인 연출 복구) */
export function chunkHoldThroughIndex(
  entry: VisualDictionaryEntry,
  visualPrefix: string,
): number {
  const starts = entry.match_start_indices?.length
    ? entry.match_start_indices
    : [visualPrefix.indexOf(entry.word)].filter((i) => i >= 0)

  let maxEnd = 0
  for (const start of starts) {
    if (!allowsIndex(entry, start)) continue
    for (const needle of expandEntryNeedles(entry)) {
      maxEnd = Math.max(maxEnd, start + needle.length)
    }
  }
  return maxEnd + 2
}
