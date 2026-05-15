/**
 * charIndex = typed.length 기준(해당 글자까지 입력했을 때 큐 적용).
 * from~to 구간을 글자마다 나눠 값을 선형 보간한다.
 */
export function charRangeSteps(
  from: number,
  to: number,
  fromValue: number,
  toValue: number,
): { charIndex: number; value: number }[] {
  if (to < from) return []
  const span = to - from
  const steps: { charIndex: number; value: number }[] = []
  for (let i = 0; i <= span; i++) {
    const t = span === 0 ? 1 : i / span
    const value = fromValue + (toValue - fromValue) * t
    steps.push({ charIndex: from + i, value: Math.round(value * 100) / 100 })
  }
  return steps
}
