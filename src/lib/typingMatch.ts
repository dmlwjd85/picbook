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
