import { useCallback, useEffect, useState } from 'react'

/** 브라우저 전체화면 — 태블릿 주소창 영역 확보 */
export function useFullscreen(targetRef?: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false)
  const supported =
    typeof document !== 'undefined' &&
    (document.documentElement.requestFullscreen != null ||
      (document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
        .webkitRequestFullscreen != null)

  useEffect(() => {
    const onChange = () => {
      const el = document.fullscreenElement
      setActive(Boolean(el))
      document.documentElement.classList.toggle('play-fullscreen', Boolean(el))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.documentElement.classList.remove('play-fullscreen')
    }
  }, [])

  const enter = useCallback(async () => {
    const el = targetRef?.current ?? document.documentElement
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      else {
        const wk = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
        await wk.webkitRequestFullscreen?.()
      }
    } catch {
      /* 사용자 제스처 거부 등 */
    }
  }, [targetRef])

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
    } catch {
      /* ignore */
    }
  }, [])

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) await exit()
    else await enter()
  }, [enter, exit])

  return { active, supported, enter, exit, toggle }
}
