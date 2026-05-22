import { CHUNK_LAYER_PREFIX } from './buildChunkVisualLayers'
import type { LayerState } from '../types/pack'

export type MergePlayLayersOptions = {
  /** 삼권분립 첫 어절 등 — 청크만 쓸 때 타임라인 큰 레이어 숨김 */
  hideTimelineForChunk?: boolean
}

/** 팩/타임라인 레이어 + 의미 청크 레이어 병합 */
export function mergePlayLayers(
  baseLayers: LayerState[],
  chunkLayers: LayerState[],
  options?: MergePlayLayersOptions,
): LayerState[] {
  if (chunkLayers.length === 0) return baseLayers

  const hideTimeline = options?.hideTimelineForChunk === true
  const filteredBase = baseLayers.filter((l) => {
    if (!l.visible || !l.imageUrl) return false
    if (hideTimeline && (l.fillHeight || (l.width ?? 100) >= 85)) return false
    return true
  })

  return [...filteredBase, ...chunkLayers].sort((a, b) => a.zIndex - b.zIndex)
}

export function isChunkLayerId(id: string): boolean {
  return id.startsWith(CHUNK_LAYER_PREFIX)
}

/** 삼권분립 팩 — 청크 구간에서 타임라인 큰 레이어 숨김(이미지 유지 구간 포함) */
export function separationChunkHidesTimeline(
  bookId: string | undefined,
  sentenceIndex: number,
  visualTypedLen: number,
): boolean {
  if (bookId !== 'demo-separation-three-powers') return false
  if (sentenceIndex === 0) {
    if (visualTypedLen <= 5) return true
    if (visualTypedLen >= 6 && visualTypedLen <= 7) return true
    return false
  }
  if (sentenceIndex === 1) return visualTypedLen <= 6
  return false
}
