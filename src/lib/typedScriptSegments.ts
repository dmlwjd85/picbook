/**
 * 제작용 스크립트 한 줄에 `타이핑할 문구 - 연출 메모` 형태를 쓸 때 사용한다.
 * 하이픈 오른쪽(연출 설명)은 플레이어·JSON에 넣지 말 것 — `takeTypingPart`로 제거한다.
 * 하이픈이 없는 줄은 통째로 타이핑 문구로 본다.
 */
export function takeTypingPart(line: string): string {
  const trim = line.trim()
  const idx = trim.indexOf(' - ')
  if (idx === -1) return trim
  return trim.slice(0, idx).trim()
}

/** 여러 줄(또는 조각)의 타이핑 부분만 이어 붙인다. 구간 사이는 공백 한 칸으로 잇는다. */
export function mergeTypedSegments(segments: readonly string[]): string {
  return segments.map(takeTypingPart).filter(Boolean).join(' ')
}

/**
 * 낱막이 시작하는 인덱스(띄어쓰기 직후)가 아니라, 그 낱막의 첫 글자를 친 뒤에 큐가 적용되도록 한다.
 * (띄어쓰기만 친 순간에는 이전 연출 유지)
 */
export function cueAfterFirstChar(wordStartIndex: number): number {
  return wordStartIndex + 1
}

/** 띄어쓰기 뒤 각 낱막이 시작하는 charIndex 목록 */
export function wordStartIndices(text: string): number[] {
  const out: number[] = []
  let i = 0
  while (i < text.length) {
    while (i < text.length && text[i] === ' ') i++
    if (i >= text.length) break
    out.push(i)
    while (i < text.length && text[i] !== ' ') i++
  }
  return out
}
