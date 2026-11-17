import { useCallback, useRef, useState } from 'react'

/** 되돌리기 기록에 남길 최대 단계 수 */
const MAX_HISTORY = 100
/** 같은 종류의 변경(예: 한 칸에 연달아 타자)이 이 시간 안에 이어지면 한 단계로 묶는다 */
const MERGE_WINDOW_MS = 1000

type History<T> = { past: T[]; present: T; future: T[] }

export type UndoableState<T> = {
  value: T
  /**
   * 값을 바꾸고 되돌리기 기록을 남긴다.
   * mergeKey를 주면 같은 key의 변경이 1초 안에 이어질 때 한 단계로 묶는다(글자 하나마다 되돌리지 않게).
   */
  commit: (next: T | ((current: T) => T), mergeKey?: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

/** 되돌리기·다시 실행이 되는 상태. isEqual이 true면 기록을 남기지 않는다 */
export function useUndoableState<T>(
  initial: T | (() => T),
  isEqual: (a: T, b: T) => boolean,
): UndoableState<T> {
  const [history, setHistory] = useState<History<T>>(() => ({
    past: [],
    present: typeof initial === 'function' ? (initial as () => T)() : initial,
    future: [],
  }))
  const lastRef = useRef<{ key: string; at: number } | null>(null)

  const commit = useCallback(
    (next: T | ((current: T) => T), mergeKey?: string) => {
      const now = Date.now()
      const last = lastRef.current
      const merge = Boolean(mergeKey && last && last.key === mergeKey && now - last.at < MERGE_WINDOW_MS)
      lastRef.current = mergeKey ? { key: mergeKey, at: now } : null
      setHistory((h) => {
        const value = typeof next === 'function' ? (next as (current: T) => T)(h.present) : next
        if (isEqual(value, h.present)) return h
        if (merge) return { past: h.past, present: value, future: [] }
        return { past: [...h.past, h.present].slice(-MAX_HISTORY), present: value, future: [] }
      })
    },
    [isEqual],
  )

  const undo = useCallback(() => {
    lastRef.current = null
    setHistory((h) => {
      if (h.past.length === 0) return h
      return {
        past: h.past.slice(0, -1),
        present: h.past[h.past.length - 1],
        future: [h.present, ...h.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    lastRef.current = null
    setHistory((h) => {
      if (h.future.length === 0) return h
      return {
        past: [...h.past, h.present],
        present: h.future[0],
        future: h.future.slice(1),
      }
    })
  }, [])

  return {
    value: history.present,
    commit,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
