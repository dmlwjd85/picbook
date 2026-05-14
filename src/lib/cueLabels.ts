import type { CueEffect } from '../types/pack'

/** 목록에 보일 때: 어떤 그림에 어떤 일이 일어났는지 짧게 */
export function summarizeEffect(e: CueEffect, layerName: (id: string) => string): string {
  const name = layerName(e.layerId)
  switch (e.kind) {
    case 'layerShow':
      return `「${name}」 보이기`
    case 'layerHide':
      return `「${name}」 숨기기`
    case 'layerImage':
      return `「${name}」 그림 바꾸기`
    case 'layerOpacity':
      return `「${name}」 투명도 ${e.opacity}`
    case 'layerTransform':
      return `「${name}」 위치·크기 조정`
    default: {
      const _x: never = e
      return String(_x)
    }
  }
}
