/** 입력이 목표 문장 앞부분과 얼마나 일치하는지 계산 */
export function longestMatchingPrefix(input: string, target: string): string {
  let i = 0
  const limit = Math.min(input.length, target.length)
  while (i < limit && input[i] === target[i]) i += 1
  return target.slice(0, i)
}

/** 조합이 끝난 뒤(또는 영문 직접 입력) — 초성 선행 일치까지 typed에 반영 */
export function syncTypingFromRaw(
  raw: string,
  target: string,
  typed: string,
  onTypedChange: (next: string) => void,
): string {
  const matched = playbackTypedPrefix(raw, target)
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

/** 조합 중인 꼬리(자음·모음·미완성 음절)만 검사 — 앞쪽 완성 글자는 건너뜀 */
function tailHasMatchingChoseong(tail: string, targetCho: string): boolean {
  if (!tail.length) return false

  let i = tail.length - 1
  while (i >= 0) {
    const code = tail.charCodeAt(i)
    const isHangulSyllable = code >= 0xac00 && code <= 0xd7a3
    if (isHangulSyllable) {
      const cho = choseongOfSyllable(tail[i]!)
      return cho === targetCho
    }
    i -= 1
  }

  for (let j = tail.length - 1; j >= 0; j--) {
    const code = tail.charCodeAt(j)
    if (code >= 0xac00 && code <= 0xd7a3) break
    const cho = choseongOfSyllable(tail[j]!)
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
