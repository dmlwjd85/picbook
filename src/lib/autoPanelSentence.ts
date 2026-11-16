import { PANEL_MAX, PANEL_MIN, type PanelSentence } from '../types/customPicbook'
import type { Cue, SentenceBlock } from '../types/pack'

/** 어절이 시작하는 글자 위치(공백 바로 다음 글자). 0은 제외 */
export function wordStartIndexes(text: string): number[] {
  const out: number[] = []
  for (let i = 1; i < text.length; i += 1) {
    if (text[i] !== ' ' && text[i - 1] === ' ') out.push(i)
  }
  return out
}

/**
 * 문장 길이를 그림 수만큼 고르게 나눠 그림별 등장 위치를 정한다.
 * - 첫 그림은 0(문장 시작)
 * - 나머지는 균등 분할 지점에서 가장 가까운 어절 시작으로 옮긴다(낱말 중간에 그림이 바뀌지 않게)
 * - 어절이 모자라면 글자 단위 균등 분할을 그대로 쓴다
 * 결과는 항상 오름차순이고 서로 겹치지 않는다.
 */
export function computeAutoCueIndexes(text: string, panelCount: number): number[] {
  const len = text.length
  if (panelCount <= 0) return []
  const cues = [0]
  const words = wordStartIndexes(text)
  // 구간 하나의 절반보다 멀리 떨어진 어절로는 옮기지 않는다
  const tolerance = len / panelCount / 2

  for (let i = 1; i < panelCount; i += 1) {
    const ideal = Math.round((len * i) / panelCount)
    const prev = cues[i - 1]
    // 뒤에 남은 그림마다 최소 한 글자씩은 남겨 둔다
    const max = len - (panelCount - i)
    let best = -1
    for (const w of words) {
      if (w <= prev || w > max || Math.abs(w - ideal) > tolerance) continue
      if (best < 0 || Math.abs(w - ideal) < Math.abs(best - ideal)) best = w
    }
    const picked = best >= 0 ? best : Math.min(Math.max(ideal, prev + 1), max)
    cues.push(Math.max(picked, prev + 1))
  }
  return cues
}

/** 저장·편집 전에 등장 위치를 규칙(첫 값 0, 오름차순, 문장 길이 안)에 맞게 다듬는다 */
export function normalizeCueIndexes(text: string, cueIndexes: number[], panelCount: number): number[] {
  if (cueIndexes.length !== panelCount) return computeAutoCueIndexes(text, panelCount)
  const out = [0]
  for (let i = 1; i < panelCount; i += 1) {
    const max = Math.max(text.length - (panelCount - i), out[i - 1] + 1)
    const v = Math.round(Number.isFinite(cueIndexes[i]) ? cueIndexes[i] : 0)
    out.push(Math.min(Math.max(v, out[i - 1] + 1), max))
  }
  return out
}

/** 그림 수와 문장 길이가 맞는지 검사 — 문제가 있으면 안내 문구 */
export function validatePanelSentence(text: string, imageCount: number): string | null {
  const t = text.trim()
  if (!t) return '문장을 입력해 주세요.'
  if (imageCount < PANEL_MIN || imageCount > PANEL_MAX) {
    return `그림은 ${PANEL_MIN}~${PANEL_MAX}장을 넣어 주세요. (지금 ${imageCount}장)`
  }
  if (t.length < imageCount) return `문장이 너무 짧아요. 그림 ${imageCount}장을 쓰려면 ${imageCount}글자 이상이어야 해요.`
  return null
}

/** 타자 글자 수가 typedLength일 때 보이는 그림 번호(0부터) */
export function activePanelIndex(cueIndexes: number[], typedLength: number): number {
  let active = 0
  for (let i = 0; i < cueIndexes.length; i += 1) {
    if (typedLength >= cueIndexes[i]) active = i
  }
  return active
}

/** 그림 문장 → 재생 엔진이 쓰는 문장 블록(레이어 1장 + 그림 교체 큐) */
export function createPanelSentenceBlock(ps: PanelSentence): SentenceBlock {
  const layerId = `${ps.id}-layer`
  const cueIndexes = normalizeCueIndexes(ps.text, ps.cueIndexes, ps.images.length)

  const show = (imageUrl: string): Cue['effects'] => [
    { kind: 'layerShow', layerId },
    { kind: 'layerImage', layerId, imageUrl },
    { kind: 'layerOpacity', layerId, opacity: 1 },
  ]

  return {
    id: ps.id,
    text: ps.text,
    layers: [
      {
        id: layerId,
        label: '장면',
        zIndex: 1,
        imageUrl: ps.images[0] ?? null,
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: 100,
        scale: 1,
        fillHeight: true,
      },
    ],
    cues: ps.images.map((imageUrl, i) => ({
      id: `${ps.id}-cue-${i}`,
      charIndex: cueIndexes[i],
      effects: show(imageUrl),
    })),
    ...(ps.closingLine?.trim() ? { closingLine: ps.closingLine.trim() } : {}),
  }
}
