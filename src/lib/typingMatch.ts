/** 입력이 목표 문장 앞부분과 얼마나 일치하는지 계산 */
export function longestMatchingPrefix(input: string, target: string): string {
  let i = 0
  const limit = Math.min(input.length, target.length)
  while (i < limit && input[i] === target[i]) i += 1
  return target.slice(0, i)
}

/**
 * IME 조합 중에도 선두 일치 길이가 늘면 부모 typed를 갱신한다.
 * (모바일에서 조합이 끝날 때만 연출이 바뀌는 문제 방지)
 */
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
