import type { CueEffect } from '../types/pack'

/** 편집기 목록용 짧은 설명 */
export function summarizeEffect(e: CueEffect): string {
  switch (e.kind) {
    case 'layerShow':
      return `보이기(${shortId(e.layerId)})`
    case 'layerHide':
      return `숨기기(${shortId(e.layerId)})`
    case 'layerImage':
      return `이미지(${shortId(e.layerId)})`
    case 'layerOpacity':
      return `투명도 ${e.opacity}(${shortId(e.layerId)})`
    case 'layerTransform':
      return `변환(${shortId(e.layerId)})`
    default: {
      const _x: never = e
      return String(_x)
    }
  }
}

function shortId(id: string): string {
  return id.slice(0, 8)
}
