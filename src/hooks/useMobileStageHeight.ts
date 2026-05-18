import { useEffect, useRef } from 'react'

/**
 * 모바일 연출 영역 높이 — 키보드가 올라와도 직전 높이를 유지해 상단 이미지가 사라지지 않게 함.
 */
export function useMobileStageHeight(
  vvHeight: number,
  keyboardInset: number,
  enabled: boolean,
  ratio: number,
): number | null {
  const lockedRef = useRef<number | null>(null)

  const computed =
    enabled && vvHeight > 0
      ? Math.max(
          140,
          Math.min(
            Math.round(vvHeight * ratio),
            Math.round(window.innerWidth * (2 / 3)),
            320,
          ),
        )
      : null

  useEffect(() => {
    if (enabled && keyboardInset === 0 && computed != null) {
      lockedRef.current = computed
    }
  }, [enabled, keyboardInset, computed])

  if (!enabled || computed == null) return null
  if (keyboardInset > 0 && lockedRef.current != null) return lockedRef.current
  return computed
}
