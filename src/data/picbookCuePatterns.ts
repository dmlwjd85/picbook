/**
 * PicBook 연출 패턴 레퍼런스 — 신규 팩 제작 시 재사용.
 * 삼권분립 데모(separationThreePowersDemoPack.ts)에서 검증된 패턴을 정리했다.
 *
 * 공통 규칙
 * - 큐 트리거: typed.length >= cue.charIndex (글자 단위, IME는 typingMatch 동기화)
 * - 낱맨 첫 글자 후 연출: cueAfterFirstChar(wordStart) → wordStart + 1
 * - 스크립트: `타이핑 문구 - 연출 메모` → 왼쪽만 text에 포함
 */

import { charRangeSteps } from '../lib/cueCharSteps'
import { cueAfterFirstChar } from '../lib/typedScriptSegments'
import type { Cue, CueEffect, LayerState } from '../types/pack'

export { charRangeSteps, cueAfterFirstChar }

/** 단어 첫 글자 입력 직후 */
export const W = cueAfterFirstChar

/** typed.length 그대로 charIndex */
export const C = (n: number) => n

// —— 장면 전환 ——

/** 페이드아웃·페이드인 대용: 레이어 숨김 → 다른 레이어 표시 + 이미지 교체 */
export function sceneSwapEffects(
  hideLayerIds: string[],
  show: { layerId: string; imageUrl: string; transform?: Partial<LayerState> },
): CueEffect[] {
  return [
    ...hideLayerIds.map((layerId) => ({ kind: 'layerHide' as const, layerId })),
    { kind: 'layerShow', layerId: show.layerId },
    { kind: 'layerImage', layerId: show.layerId, imageUrl: show.imageUrl },
    ...(show.transform
      ? [{ kind: 'layerTransform' as const, layerId: show.layerId, ...show.transform }]
      : []),
  ]
}

/** 단일 레이어 불투명도 (페이드) */
export function fadeOpacity(layerId: string, opacity: number): CueEffect {
  return { kind: 'layerOpacity', layerId, opacity }
}

// —— 분할·레이아웃 ——

/** 화면을 가로로 나눠 레이어 width·x 배치 (삼권분할·찌그러뜨리기) */
export function splitRowEffects(
  layers: { layerId: string; x: number; width: number; fillHeight?: boolean }[],
): CueEffect[] {
  return layers.map(({ layerId, x, width, fillHeight }) => ({
    kind: 'layerTransform',
    layerId,
    x,
    y: 0,
    width,
    fillHeight: fillHeight ?? true,
  }))
}

/** charRangeSteps + splitRow로 구간마다 한 레이어가 화면을 점유 */
export function squeezeSplitCue(
  charIndex: number,
  justiceWidthPct: number,
  layerJustice: string,
  layerLegis: string,
  layerExec: string,
): Cue {
  const rem = 100 - justiceWidthPct
  const half = rem / 2
  return {
    id: `squeeze-${charIndex}`,
    charIndex,
    effects: splitRowEffects([
      { layerId: layerJustice, x: 0, width: justiceWidthPct },
      { layerId: layerLegis, x: justiceWidthPct, width: half },
      { layerId: layerExec, x: justiceWidthPct + half, width: half },
    ]),
  }
}

// —— 줌 ——

/** 글자 구간마다 scale·panY 선형 줌인 */
export function zoomInCharSteps(
  from: number,
  to: number,
  layerId: string,
  scaleFrom: number,
  scaleTo: number,
  panYFactor = 28,
): Cue[] {
  return charRangeSteps(from, to, scaleFrom, scaleTo).map(({ charIndex, value }) => ({
    id: `zoom-${layerId}-${charIndex}`,
    charIndex,
    effects: [
      {
        kind: 'layerTransform',
        layerId,
        scale: value,
        panY: -Math.round((value - 1) * panYFactor),
      },
    ],
  }))
}

/** 균형·마무리 클로즈업 */
export function balanceZoomCue(charIndex: number, layerId: string, scale: number): Cue {
  return {
    id: `balance-${charIndex}`,
    charIndex,
    effects: [{ kind: 'layerTransform', layerId, scale, fillHeight: true }],
  }
}

// —— 화면 떨림 ——

/** panX·panY로 흔들림 (견제 장면) */
export function shakeAt(charIndex: number, layerId: string, panX: number, panY: number): Cue {
  return {
    id: `shake-${charIndex}`,
    charIndex,
    effects: [{ kind: 'layerTransform', layerId, panX, panY }],
  }
}

// —— 스탬프·라벨 ——

export function redStampAt(charIndex: number, layerId: string): Cue {
  return {
    id: `stamp-${charIndex}`,
    charIndex,
    effects: [{ kind: 'layerStampOverlay', layerId, stamp: 'red-x' }],
  }
}

export function clearStampAt(_charIndex: number, layerId: string): CueEffect {
  return { kind: 'layerStampOverlay', layerId, stamp: null }
}

export function anchorLabelsAt(
  charIndex: number,
  layerId: string,
  labels: { text: string; leftPct: number; topPct: number }[],
): Cue {
  return {
    id: `anchors-${charIndex}`,
    charIndex,
    effects: [{ kind: 'layerAnchorLabels', layerId, labels }],
  }
}
