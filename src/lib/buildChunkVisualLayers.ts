import { expandEntryNeedles } from './visualDictionaryNeedles'
import { resolveVisualImageUrl } from './visualDictionaryPaths'
import type { LayerState } from '../types/pack'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

export const CHUNK_LAYER_PREFIX = 'vd-chunk-'

type BoxLayout = { x: number; y: number; width: number; height: number }

/** 한 글자 청크 — 연출창 전체(3:2 스테이지) */
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

function allowsIndex(entry: VisualDictionaryEntry, index: number): boolean {
  const allowed = entry.match_start_indices
  if (!allowed?.length) return true
  return allowed.includes(index)
}

/** 지금 치고 있는 글자(초성 선행 포함) 한 글자에 맞는 청크 1개 */
function entryForFocusIndex(
  visualPrefix: string,
  entries: VisualDictionaryEntry[],
): VisualDictionaryEntry | null {
  if (!visualPrefix.length) return null
  const focusIdx = visualPrefix.length - 1
  const focusCh = visualPrefix[focusIdx]
  if (!focusCh) return null

  for (const entry of entries) {
    if (entry.status === 'deprecated') continue
    if (!allowsIndex(entry, focusIdx)) continue

    if (entry.word.length === 1 && entry.word === focusCh) {
      return entry
    }

    for (const hint of entry.chunk_hints) {
      if (hint.length === 1 && hint === focusCh) {
        return entry
      }
    }
  }

  const multi = [...entries]
    .filter((e) => e.status !== 'deprecated' && e.word.length > 1)
    .sort((a, b) => b.word.length - a.word.length)

  for (const entry of multi) {
    const starts = entry.match_start_indices?.length
      ? entry.match_start_indices
      : [visualPrefix.indexOf(entry.word)].filter((i) => i >= 0)

    for (const start of starts) {
      if (!allowsIndex(entry, start)) continue
      for (const needle of expandEntryNeedles(entry)) {
        if (needle.length <= 1) continue
        const end = start + needle.length
        if (end - 1 !== focusIdx) continue
        if (visualPrefix.slice(start, end) === needle) {
          return entry
        }
      }
    }
  }

  return null
}

/** 미리보기·디버그용 */
export function getChunkEntryForFocus(
  visualPrefix: string,
  entries: VisualDictionaryEntry[],
): VisualDictionaryEntry | null {
  return entryForFocusIndex(visualPrefix, entries)
}

/** 타자 문자열(초성 선행 반영) → 스테이지 레이어 — 한 글자씩 1장 */
export function buildChunkVisualLayers(
  visualPrefix: string,
  entries: VisualDictionaryEntry[],
): LayerState[] {
  if (!visualPrefix.trim() || entries.length === 0) return []

  const entry = entryForFocusIndex(visualPrefix, entries)
  if (!entry) return []

  return [entryToLayer(entry, SINGLE_BOX)]
}
