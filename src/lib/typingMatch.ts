/** 입력이 목표 문장 앞부분과 얼마나 일치하는지 계산 */
export function longestMatchingPrefix(input: string, target: string): string {
  let i = 0
  const limit = Math.min(input.length, target.length)
  while (i < limit && input[i] === target[i]) i += 1
  return target.slice(0, i)
}

/** 조합이 끝난 뒤(또는 영문 직접 입력) 선두 일치 길이만 부모 typed에 반영 */
export function syncTypingFromRaw(
  raw: string,
  target: string,
  typed: string,
  onTypedChange: (next: string) => void,
): string {
  const matched = longestMatchingPrefix(raw, target)
  if (matched !== typed) onTypedChange(matched)
  return matched
}

const CHOSEONG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
] as const

const JAMO_CHO: Record<string, string> = Object.fromEntries(CHOSEONG.map((c) => [c, c]))

function choseongOfSyllable(ch: string): string | null {
  const c = ch.charCodeAt(0)
  if (c >= 0xac00 && c <= 0xd7a3) {
    return CHOSEONG[Math.floor((c - 0xac00) / 588)] ?? null
  }
  return JAMO_CHO[ch] ?? null
}

function tailHasMatchingChoseong(tail: string, targetCho: string): boolean {
  for (let i = tail.length - 1; i >= 0; i--) {
    const cho = choseongOfSyllable(tail[i]!)
    if (cho === targetCho) return true
  }
  return false
}

/**
 * 연출·청크용 — 글자마다 초성만 맞아도 해당 글자까지 선행 반영(모든 픽북 공통)
 */
export function playbackTypedPrefix(raw: string, target: string): string {
  let len = longestMatchingPrefix(raw, target).length

  while (len < target.length) {
    const targetCh = target[len]
    if (!targetCh) break
    const targetCho = choseongOfSyllable(targetCh)
    if (!targetCho) break

    const tail = raw.slice(len)
    if (!tail) break

    if (tailHasMatchingChoseong(tail, targetCho)) {
      len += 1
      continue
    }
    break
  }

  return target.slice(0, len)
}

/** 타이핑·조합 중 글자 수(연출 큐·청크와 동일하게 draft 반영) */
export function playbackTypedLength(target: string, typed: string, draft: string): number {
  const raw = draft.length > typed.length ? draft : typed
  return playbackTypedPrefix(raw, target).length
}
