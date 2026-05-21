import { findVisualMatchesInText } from './matchVisualChunks'
import { resolveVisualImageUrl } from './visualDictionaryPaths'
import type { LayerState } from '../types/pack'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

export const CHUNK_LAYER_PREFIX = 'vd-chunk-'

type BoxLayout = { x: number; y: number; width: number; height: number }

/** 한 문장에 N개 오버레이 — 왼쪽부터 겹치지 않게 배치 */
function overlayBoxLayouts(count: number): BoxLayout[] {
  if (count <= 0) return []
  if (count === 1) return [{ x: 6, y: 10, width: 88, height: 80 }]
  if (count === 2) {
    return [
      { x: 2, y: 10, width: 47, height: 80 },
      { x: 51, y: 10, width: 47, height: 80 },
    ]
  }
  if (count === 3) {
    return [
      { x: 2, y: 10, width: 31, height: 80 },
      { x: 34, y: 10, width: 31, height: 80 },
      { x: 66, y: 10, width: 31, height: 80 },
    ]
  }
  if (count === 4) {
    return [
      { x: 2, y: 5, width: 47, height: 44 },
      { x: 51, y: 5, width: 47, height: 44 },
      { x: 2, y: 51, width: 47, height: 44 },
      { x: 51, y: 51, width: 47, height: 44 },
    ]
  }
  const layouts: BoxLayout[] = []
  const cols = 3
  const cellW = 31
  const cellH = 38
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    layouts.push({
      x: 2 + col * (cellW + 2),
      y: 5 + row * (cellH + 4),
      width: cellW,
      height: cellH,
    })
  }
  return layouts
}

function entryToLayer(entry: VisualDictionaryEntry, box: BoxLayout, bg: boolean): LayerState {
  const url = resolveVisualImageUrl(entry)
  if (bg) {
    return {
      id: `${CHUNK_LAYER_PREFIX}${entry.word_id}`,
      label: entry.word,
      zIndex: entry.z_index,
      imageUrl: url,
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      scale: 1,
      fillHeight: true,
      panX: 0,
      panY: 0,
    }
  }
  return {
    id: `${CHUNK_LAYER_PREFIX}${entry.word_id}`,
    label: entry.word,
    zIndex: entry.z_index,
    imageUrl: url,
    visible: true,
    opacity: 1,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    scale: 1,
    fillHeight: false,
    panX: 0,
    panY: 0,
  }
}

/** 타자 문자열에 매칭된 의미 청크 → 스테이지 레이어 (누적, 좌→우 배치) */
export function buildChunkVisualLayers(
  typed: string,
  entries: VisualDictionaryEntry[],
): LayerState[] {
  if (!typed.trim() || entries.length === 0) return []

  const matches = findVisualMatchesInText(typed, entries)
  if (matches.length === 0) return []

  const layers: LayerState[] = []

  const bgMatches = matches.filter((m) => m.entry.part_of_speech === 'background')
  const lastBg = bgMatches[bgMatches.length - 1]
  if (lastBg) {
    layers.push(entryToLayer(lastBg.entry, { x: 0, y: 0, width: 100, height: 100 }, true))
  }

  const seen = new Set<string>()
  const ordered: VisualDictionaryEntry[] = []
  const sortedMatches = [...matches].sort((a, b) => a.start - b.start || a.end - b.end)
  for (const m of sortedMatches) {
    if (m.entry.part_of_speech === 'background') continue
    if (seen.has(m.entry.word_id)) continue
    seen.add(m.entry.word_id)
    ordered.push(m.entry)
  }

  const boxes = overlayBoxLayouts(ordered.length)
  ordered.forEach((entry, i) => {
    layers.push(entryToLayer(entry, boxes[i]!, false))
  })

  return layers.sort((a, b) => a.zIndex - b.zIndex)
}
