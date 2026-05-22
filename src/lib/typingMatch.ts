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
 * 연출·청크 매칭용 — 조합 중에도 다음 글자 초성이 맞으면 한 글자 앞당겨 반영
 * (완성형이 아니어도 이미지가 늦게 뜨지 않게, ㄹ·ㅅ 등 자모만 있어도 동작)
 */
export function playbackTypedPrefix(raw: string, target: string): string {
  const matched = longestMatchingPrefix(raw, target)
  if (matched.length >= target.length) return matched

  const nextIdx = matched.length
  const targetCh = target[nextIdx]
  if (!targetCh) return matched

  const tail = raw.slice(matched.length)
  if (!tail) return matched

  const targetCho = choseongOfSyllable(targetCh)
  if (!targetCho) return matched

  if (tailHasMatchingChoseong(tail, targetCho)) {
    return target.slice(0, nextIdx + 1)
  }
  return matched
}

/** 타이핑·조합 중 글자 수(연출 큐·청크와 동일하게 draft 반영) */
export function playbackTypedLength(target: string, typed: string, draft: string): number {
  const raw = draft.length > typed.length ? draft : typed
  return playbackTypedPrefix(raw, target).length
}
