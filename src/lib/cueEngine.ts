import type { CueEffect, LayerState, SentenceBlock } from '../types/pack'

function cloneLayer(l: LayerState): LayerState {
  return { ...l }
}

function applyEffect(map: Map<string, LayerState>, eff: CueEffect): void {
  const layer = map.get(eff.layerId)
  if (!layer) return

  switch (eff.kind) {
    case 'layerShow':
      layer.visible = true
      break
    case 'layerHide':
      layer.visible = false
      break
    case 'layerImage':
      layer.imageUrl = eff.imageUrl
      break
    case 'layerOpacity':
      layer.opacity = Math.max(0, Math.min(1, eff.opacity))
      break
    case 'layerAnchorLabels':
      layer.anchorLabels = eff.labels ?? null
      break
    case 'layerStampOverlay':
      layer.stampOverlay = eff.stamp
      break
    case 'layerTransform': {
      if (eff.x !== undefined) layer.x = eff.x
      if (eff.y !== undefined) layer.y = eff.y
      if (eff.width !== undefined) layer.width = eff.width
      if (eff.scale !== undefined) layer.scale = eff.scale
      if (eff.fillHeight !== undefined) layer.fillHeight = eff.fillHeight
      if (eff.panX !== undefined) layer.panX = eff.panX
      if (eff.panY !== undefined) layer.panY = eff.panY
      break
    }
    default:
      break
  }
}

/**
 * 문장의 초기 레이어 + typedLength 이하 charIndex를 가진 큐들을 순서대로 적용한 스냅샷.
 */
export function computeLayerSnapshot(sentence: SentenceBlock, typedLength: number): LayerState[] {
  const map = new Map<string, LayerState>()
  for (const l of sentence.layers) {
    map.set(l.id, cloneLayer(l))
  }

  const sorted = sentence.cues
    .map((c, cueOrder) => ({ c, cueOrder }))
    .sort((a, b) => {
      if (a.c.charIndex !== b.c.charIndex) return a.c.charIndex - b.c.charIndex
      return a.cueOrder - b.cueOrder
    })

  for (const { c: cue } of sorted) {
    if (cue.charIndex > typedLength) break
    for (const eff of cue.effects) {
      applyEffect(map, eff)
    }
  }

  return [...map.values()].sort((a, b) => a.zIndex - b.zIndex)
}
