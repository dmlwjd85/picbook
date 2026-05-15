import { useEffect, useState } from 'react'

/**
 * 가상 키보드가 올라올 때 하단 여백(px).
 * visualViewport로 계산해 연출 고정 레이아웃에서 입력창이 가려지지 않게 한다.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const gap = window.innerHeight - vv.height - vv.offsetTop
      setInset(Math.max(0, Math.round(gap)))
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    window.addEventListener('orientationchange', update)

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return inset
}
