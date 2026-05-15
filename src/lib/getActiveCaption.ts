/**
 * captions는 charIndex 오름차순으로 두고,
 * typedLength 이하인 것 중 가장 마지막 문구를 화면에 씁니다.
 */
export function getActiveCaption(
  captions: { charIndex: number; text: string }[] | undefined,
  typedLength: number,
): string | null {
  if (!captions || captions.length === 0) return null
  const sorted = [...captions].sort((a, b) => a.charIndex - b.charIndex)
  let last: string | null = null
  for (const c of sorted) {
    if (typedLength >= c.charIndex) last = c.text
  }
  return last
}
