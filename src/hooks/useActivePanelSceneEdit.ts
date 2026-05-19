import { useMemo } from 'react'
import { usePicbookSceneEditStore } from '../state/picbookSceneEditStore'
import type { LayerState } from '../types/pack'
import type { PanelSceneEdit } from '../types/sceneEdit'

/** 재생 중 보이는 패널 URL에 맞는 마스터 연출 */
export function useActivePanelSceneEdit(
  bookId: string | undefined,
  layers: LayerState[],
): PanelSceneEdit | null {
  const getPanelEdit = usePicbookSceneEditStore((s) => s.getPanelEdit)

  return useMemo(() => {
    if (!bookId) return null
    const visible = layers.filter((l) => l.visible && l.imageUrl)
    const url = visible[visible.length - 1]?.imageUrl
    if (!url) return null
    return getPanelEdit(bookId, url)
  }, [bookId, layers, getPanelEdit])
}
