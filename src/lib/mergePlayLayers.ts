import { CHUNK_LAYER_PREFIX } from './buildChunkVisualLayers'
import type { LayerState } from '../types/pack'

/** 팩/타임라인 레이어 + 의미 청크 레이어 병합 */
export function mergePlayLayers(baseLayers: LayerState[], chunkLayers: LayerState[]): LayerState[] {
  if (chunkLayers.length === 0) return baseLayers

  const filteredBase = baseLayers.filter((l) => {
    if (!l.visible || !l.imageUrl) return false
    // 청크 연출 중 samgwon·도입 전체화면 등과 겹치지 않게 큰 레이어 숨김
    if (l.fillHeight || (l.width ?? 100) >= 85) return false
    return true
  })

  return [...filteredBase, ...chunkLayers].sort((a, b) => a.zIndex - b.zIndex)
}

export function isChunkLayerId(id: string): boolean {
  return id.startsWith(CHUNK_LAYER_PREFIX)
}
