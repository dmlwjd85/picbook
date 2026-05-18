import { useEffect, useState } from 'react'

export type VisualViewportLayout = {
  /** 가상 키보드로 가려지는 하단 높이(px) */
  inset: number
  /** 보이는 뷰포트 높이(px) */
  height: number
  /** visualViewport 상단 오프셋(px) — iOS 키보드 시 레이아웃 보정 */
  offsetTop: number
}

/**
 * visualViewport 기반 레이아웃 — 모바일 키보드·보이는 영역에 맞춘 CSS 변수 설정.
 */
export function useVisualViewportLayout(): VisualViewportLayout {
  const [layout, setLayout] = useState<VisualViewportLayout>(() => ({
    inset: 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    offsetTop: 0,
  }))

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const inset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
      const height = Math.round(vv.height)
      const offsetTop = Math.round(vv.offsetTop)
      setLayout({ inset, height, offsetTop })

      const root = document.documentElement
      root.style.setProperty('--keyboard-inset', `${inset}px`)
      root.style.setProperty('--vv-height', `${height}px`)
      root.style.setProperty('--vv-offset-top', `${offsetTop}px`)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    window.addEventListener('orientationchange', update)

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      window.removeEventListener('orientationchange', update)
      const root = document.documentElement
      root.style.removeProperty('--keyboard-inset')
      root.style.removeProperty('--vv-height')
      root.style.removeProperty('--vv-offset-top')
    }
  }, [])

  return layout
}

/**
 * 가상 키보드가 올라올 때 하단 여백(px).
 * visualViewport로 계산해 연출 고정 레이아웃에서 입력창이 가려지지 않게 한다.
 */
export function useKeyboardInset(): number {
  return useVisualViewportLayout().inset
}
