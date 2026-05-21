import { findVisualMatchesInText } from './matchVisualChunks'
import { resolveVisualImageUrl } from './visualDictionaryPaths'
import type { LayerState } from '../types/pack'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

export const CHUNK_LAYER_PREFIX = 'vd-chunk-'

function layoutForOverlay(entry: VisualDictionaryEntry, slot: number): Pick<LayerState, 'x' | 'y' | 'width' | 'scale' | 'fillHeight'> {
  const pos = entry.part_of_speech
  if (pos === 'emotion' || pos === 'effect') {
    return { x: 62, y: 8 + (slot % 2) * 12, width: 28, scale: 1.05, fillHeight: false }
  }
  if (pos === 'verb') {
    return { x: 4, y: 55 + (slot % 2) * 8, width: 38, scale: 1, fillHeight: false }
  }
  if (pos === 'adjective') {
    return { x: 50, y: 62, width: 32, scale: 1, fillHeight: false }
  }
  const col = slot % 2
  return {
    x: 6 + col * 42,
    y: 18 + Math.floor(slot / 2) * 8,
    width: 42,
    scale: 1,
    fillHeight: true,
  }
}

function entryToLayer(entry: VisualDictionaryEntry, slot: number, bg: boolean): LayerState {
  const url = resolveVisualImageUrl(entry)
  const layout = bg
    ? { x: 0, y: 0, width: 100, scale: 1, fillHeight: true }
    : layoutForOverlay(entry, slot)

  return {
    id: `${CHUNK_LAYER_PREFIX}${entry.word_id}`,
    label: entry.word,
    zIndex: entry.z_index,
    imageUrl: url,
    visible: true,
    opacity: 1,
    panX: 0,
    panY: 0,
    ...layout,
  }
}

/** 타자 문자열에 매칭된 의미 청크 → 스테이지 레이어 (누적) */
export function buildChunkVisualLayers(
  typed: string,
  entries: VisualDictionaryEntry[],
): LayerState[] {
  if (!typed.trim() || entries.length === 0) return []

  const matches = findVisualMatchesInText(typed, entries)
  if (matches.length === 0) return []

  const bgMatches = matches.filter((m) => m.entry.part_of_speech === 'background')
  const overlayMatches = matches.filter((m) => m.entry.part_of_speech !== 'background')

  const layers: LayerState[] = []

  const lastBg = bgMatches[bgMatches.length - 1]
  if (lastBg) {
    layers.push(entryToLayer(lastBg.entry, 0, true))
  }

  const activeById = new Map<string, VisualDictionaryEntry>()
  for (const m of overlayMatches) {
    activeById.set(m.entry.word_id, m.entry)
  }

  const sorted = [...activeById.values()].sort((a, b) => a.z_index - b.z_index || a.word.localeCompare(b.word, 'ko'))

  let slot = 0
  for (const entry of sorted) {
    layers.push(entryToLayer(entry, slot++, false))
  }

  return layers
}
