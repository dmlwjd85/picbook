import { findVisualMatchesInText } from './matchVisualChunks'
import { resolveVisualImageUrl } from './visualDictionaryPaths'
import type { LayerState } from '../types/pack'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

export const CHUNK_LAYER_PREFIX = 'vd-chunk-'

type BoxLayout = { x: number; y: number; width: number; height: number }

/** 합쳐 표시할 때만 — 왼쪽부터 겹치지 않게 */
function overlayBoxLayouts(count: number): BoxLayout[] {
  if (count <= 0) return []
  if (count === 1) return [{ x: 6, y: 8, width: 88, height: 84 }]
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
  return [
    { x: 2, y: 5, width: 47, height: 44 },
    { x: 51, y: 5, width: 47, height: 44 },
    { x: 2, y: 51, width: 47, height: 44 },
    { x: 51, y: 51, width: 47, height: 44 },
  ].slice(0, count)
}

/** 한 글자 청크 — 연출창 여백 최소 */
const SINGLE_BOX: BoxLayout = { x: 0, y: 0, width: 100, height: 100 }

function entryToLayer(entry: VisualDictionaryEntry, box: BoxLayout): LayerState {
  const plate = entry.plate_caption?.trim() || null
  const anchors = entry.anchor_labels?.length ? entry.anchor_labels : null
  return {
    id: `${CHUNK_LAYER_PREFIX}${entry.word_id}`,
    label: entry.word,
    zIndex: entry.z_index,
    imageUrl: resolveVisualImageUrl(entry),
    visible: true,
    opacity: 1,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    scale: 1,
    fillHeight: !plate && !anchors && box.width >= 96,
    panX: 0,
    panY: 0,
    plateCaption: plate,
    anchorLabels: anchors,
  }
}

/** combine_group가 같으면 한 화면에 여러 장, 아니면 가장 최근 매칭 1장만 */
function pickVisibleEntries(
  matches: ReturnType<typeof findVisualMatchesInText>,
): VisualDictionaryEntry[] {
  if (matches.length === 0) return []

  const sorted = [...matches].sort((a, b) => a.start - b.start || a.end - b.end)
  const seen = new Set<string>()
  const ordered: VisualDictionaryEntry[] = []
  for (const m of sorted) {
    if (seen.has(m.entry.word_id)) continue
    seen.add(m.entry.word_id)
    ordered.push(m.entry)
  }

  const latest = sorted[sorted.length - 1]!
  const group = latest.entry.combine_group?.trim()
  if (group) {
    const grouped = ordered.filter((e) => e.combine_group?.trim() === group)
    if (grouped.length > 0) return grouped
  }

  return [latest.entry]
}

/** 타자 문자열 → 스테이지 레이어 (기본 1장, combine_group 시에만 다중) */
export function buildChunkVisualLayers(
  typed: string,
  entries: VisualDictionaryEntry[],
): LayerState[] {
  if (!typed.trim() || entries.length === 0) return []

  const matches = findVisualMatchesInText(typed, entries)
  if (matches.length === 0) return []

  const tailLen = typed.length
  const tailMatches = matches.filter((m) => m.end === tailLen)
  if (tailMatches.length === 0) return []

  const visible = pickVisibleEntries(tailMatches)
  const boxes = overlayBoxLayouts(visible.length)

  return visible
    .map((entry, i) => entryToLayer(entry, boxes[i] ?? SINGLE_BOX))
    .sort((a, b) => a.zIndex - b.zIndex)
}
