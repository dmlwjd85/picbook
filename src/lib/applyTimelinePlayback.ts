import type { LayerState } from '../types/pack'
import type { PanelSceneEdit } from '../types/sceneEdit'
import type { CharFrameEdit, SentenceTimeline, TimelineInsert } from '../types/timeline'
import { getTimelineAudioObjectUrl, getTimelineImageObjectUrl } from './timelineMediaDb'
import { activeInsert, mergeFrameEditsUpTo } from './mergeFrameEdits'
import { defaultPanelSceneEdit } from '../types/sceneEdit'

export type ResolvedMedia = {
  imageUrls: Map<string, string>
  audioUrls: Map<string, string>
}

export type TimelineStageFx = {
  sceneTransition: PanelSceneEdit['transition']
  stagingEffect: PanelSceneEdit['staging']
  masterTextOverlay: PanelSceneEdit['textOverlay'] | null
}

const INSERT_LAYER_ID = 'timeline-insert-overlay'

/** 커스텀 미디어 키 목록 수집 */
export function collectTimelineMediaKeys(
  timeline: SentenceTimeline,
  charIndex: number,
): { imageKeys: string[]; audioKeys: string[] } {
  const merged = mergeFrameEditsUpTo(timeline, charIndex)
  const ins = activeInsert(timeline, charIndex)
  const imageKeys: string[] = []
  const audioKeys: string[] = []

  if (merged.customImageId) imageKeys.push(merged.customImageId)
  if (merged.sfx?.customAudioId) audioKeys.push(merged.sfx.customAudioId)
  if (ins?.customImageId) imageKeys.push(ins.customImageId)
  if (timeline.bgm?.customAudioId) audioKeys.push(timeline.bgm.customAudioId)

  return { imageKeys: [...new Set(imageKeys)], audioKeys: [...new Set(audioKeys)] }
}

export async function resolveTimelineMedia(
  timeline: SentenceTimeline,
  charIndex: number,
): Promise<ResolvedMedia> {
  const { imageKeys, audioKeys } = collectTimelineMediaKeys(timeline, charIndex)
  const imageUrls = new Map<string, string>()
  const audioUrls = new Map<string, string>()

  await Promise.all([
    ...imageKeys.map(async (k) => {
      const url = await getTimelineImageObjectUrl(k)
      if (url) imageUrls.set(k, url)
    }),
    ...audioKeys.map(async (k) => {
      const url = await getTimelineAudioObjectUrl(k)
      if (url) audioUrls.set(k, url)
    }),
  ])

  return { imageUrls, audioUrls }
}

function pickMainLayer(layers: LayerState[]): LayerState | null {
  const visible = layers.filter((l) => l.visible && l.imageUrl)
  const fill = visible.filter((l) => l.fillHeight)
  if (fill.length > 0) return fill[fill.length - 1]!
  return visible[visible.length - 1] ?? null
}

function applyEditToLayer(layer: LayerState, edit: CharFrameEdit, media: ResolvedMedia): LayerState {
  const next = { ...layer }
  if (edit.customImageId) {
    const url = media.imageUrls.get(edit.customImageId)
    if (url) next.imageUrl = url
  } else if (edit.imageUrl) {
    next.imageUrl = edit.imageUrl
  }
  if (edit.scale !== undefined) next.scale = edit.scale
  if (edit.panX !== undefined) next.panX = edit.panX
  if (edit.panY !== undefined) next.panY = edit.panY
  return next
}

function buildInsertLayer(ins: TimelineInsert, media: ResolvedMedia): LayerState | null {
  let imageUrl: string | null = null
  if (ins.customImageId) {
    imageUrl = media.imageUrls.get(ins.customImageId) ?? null
  } else if (ins.imageUrl) {
    imageUrl = ins.imageUrl
  }
  if (!imageUrl) return null

  return {
    id: INSERT_LAYER_ID,
    label: '삽입 컷',
    zIndex: 99,
    imageUrl,
    visible: true,
    opacity: 1,
    x: 0,
    y: 0,
    width: 100,
    scale: ins.scale ?? 1,
    fillHeight: true,
    panX: ins.panX ?? 0,
    panY: ins.panY ?? 0,
  }
}

export function resolveTimelineStageFx(
  timeline: SentenceTimeline,
  charIndex: number,
  panelFallback: PanelSceneEdit | null,
): TimelineStageFx {
  const merged = mergeFrameEditsUpTo(timeline, charIndex)
  const ins = activeInsert(timeline, charIndex)
  const base = panelFallback ?? defaultPanelSceneEdit()

  const sceneTransition = merged.transition ?? ins?.transition ?? base.transition
  const stagingEffect = merged.staging ?? ins?.staging ?? base.staging
  const overlay = merged.textOverlay?.text.trim()
    ? merged.textOverlay
    : base.textOverlay?.text.trim()
      ? base.textOverlay
      : null

  return {
    sceneTransition,
    stagingEffect,
    masterTextOverlay: overlay,
  }
}

/** 팩 스냅샷 + 타임라인 → 재생용 레이어 */
export function applyTimelineToLayers(
  baseLayers: LayerState[],
  timeline: SentenceTimeline,
  charIndex: number,
  media: ResolvedMedia,
): LayerState[] {
  const merged = mergeFrameEditsUpTo(timeline, charIndex)
  const hasFrameEdit =
    merged.imageUrl ||
    merged.customImageId ||
    merged.scale !== undefined ||
    merged.panX !== undefined ||
    merged.panY !== undefined

  let layers = baseLayers.map((l) => ({ ...l }))

  if (hasFrameEdit) {
    const main = pickMainLayer(layers)
    if (main) {
      layers = layers.map((l) => (l.id === main.id ? applyEditToLayer(l, merged, media) : l))
    }
  }

  const ins = activeInsert(timeline, charIndex)
  if (ins) {
    layers = layers.filter((l) => l.id !== INSERT_LAYER_ID)
    const insertLayer = buildInsertLayer(ins, media)
    if (insertLayer) layers = [...layers, insertLayer]
  } else {
    layers = layers.filter((l) => l.id !== INSERT_LAYER_ID)
  }

  return layers.sort((a, b) => a.zIndex - b.zIndex)
}
