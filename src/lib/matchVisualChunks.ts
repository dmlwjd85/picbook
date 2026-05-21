import type { VisualDictionaryEntry } from '../types/visualDictionary'

export type ChunkMatch = {
  entry: VisualDictionaryEntry
  matchedText: string
  start: number
  end: number
}

/** 표제어·유사어·청크힌트로 입력 텍스트에서 가장 긴 매칭 (형태소 분석 전 단계) */
function allNeedles(entry: VisualDictionaryEntry): string[] {
  const set = new Set<string>()
  set.add(entry.word)
  for (const s of entry.synonyms) {
    const t = s.trim()
    if (t) set.add(t)
  }
  for (const h of entry.chunk_hints) {
    const t = h.trim()
    if (t) set.add(t)
  }
  return [...set].sort((a, b) => b.length - a.length)
}

export function findVisualMatchesInText(
  text: string,
  entries: VisualDictionaryEntry[],
  fromIndex = 0,
): ChunkMatch[] {
  const slice = text.slice(fromIndex)
  const offset = fromIndex
  const used: boolean[] = new Array(slice.length).fill(false)
  const matches: ChunkMatch[] = []

  const sortedEntries = [...entries].sort((a, b) => {
    const al = allNeedles(a)[0]?.length ?? 0
    const bl = allNeedles(b)[0]?.length ?? 0
    return bl - al
  })

  for (const entry of sortedEntries) {
    if (entry.status === 'deprecated') continue
    for (const needle of allNeedles(entry)) {
      let i = 0
      while (i < slice.length) {
        const idx = slice.indexOf(needle, i)
        if (idx < 0) break
        const end = idx + needle.length
        let overlap = false
        for (let j = idx; j < end; j++) {
          if (used[j]) {
            overlap = true
            break
          }
        }
        if (!overlap) {
          for (let j = idx; j < end; j++) used[j] = true
          matches.push({
            entry,
            matchedText: needle,
            start: offset + idx,
            end: offset + end,
          })
        }
        i = idx + 1
      }
    }
  }

  return matches.sort((a, b) => a.start - b.start)
}

/** 타자 진행 문자열에서 방금 완성된 어절(공백·구두점 기준)에 매칭 */
export function matchLatestTypedChunk(
  typed: string,
  entries: VisualDictionaryEntry[],
): ChunkMatch | null {
  const trimmed = typed.trimEnd()
  if (!trimmed) return null

  const all = findVisualMatchesInText(trimmed, entries)
  if (all.length === 0) return null

  const last = all[all.length - 1]!
  if (last.end !== trimmed.length) {
    const tail = trimmed.slice(last.end).trim()
    if (tail.length > 0) return null
  }
  return last
}
