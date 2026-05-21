import type { VisualDictionaryEntry } from '../types/visualDictionary'

/** 조사 제거 후보 (형태소 분석 전) */
function wordVariants(word: string): string[] {
  const out = new Set<string>([word])
  const particles = [
    '에서는',
    '으로',
    '에서',
    '까지',
    '부터',
    '이라',
    '이랑',
    '랑',
    '가',
    '이',
    '는',
    '은',
    '을',
    '를',
    '에',
    '와',
    '과',
    '도',
    '로',
    '다',
    '야',
    '요',
    '다가',
    '의',
  ]
  for (const p of particles) {
    if (word.endsWith(p) && word.length > p.length + 1) {
      out.add(word.slice(0, -p.length))
    }
  }
  return [...out]
}

export function expandEntryNeedles(entry: VisualDictionaryEntry): string[] {
  const set = new Set<string>()
  set.add(entry.word)
  for (const v of wordVariants(entry.word)) set.add(v)
  for (const s of entry.synonyms) {
    const t = s.trim()
    if (!t) continue
    set.add(t)
    for (const v of wordVariants(t)) set.add(v)
  }
  for (const h of entry.chunk_hints) {
    const t = h.trim()
    if (t) set.add(t)
  }
  return [...set].sort((a, b) => b.length - a.length)
}
