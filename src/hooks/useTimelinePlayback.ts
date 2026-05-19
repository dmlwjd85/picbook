import { useEffect, useMemo, useRef, useState } from 'react'
import type { LayerState, SentenceBlock } from '../types/pack'
import { computeLayerSnapshot } from '../lib/cueEngine'
import {
  applyTimelineToLayers,
  resolveTimelineMedia,
  resolveTimelineStageFx,
  type TimelineStageFx,
} from '../lib/applyTimelinePlayback'
import { usePicbookTimelineStore } from '../state/picbookTimelineStore'
import { useActivePanelSceneEdit } from './useActivePanelSceneEdit'

export type TimelinePlaybackState = {
  layers: LayerState[]
  stageFx: TimelineStageFx
  mediaReady: boolean
}

/** 문장 + 글자 수 + 타임라인 → 연출 레이어·전환·효과 */
export function useTimelinePlayback(
  bookId: string | undefined,
  sentence: SentenceBlock | undefined,
  typedLength: number,
): TimelinePlaybackState {
  const timeline = usePicbookTimelineStore((s) =>
    bookId && sentence ? s.byBook[bookId]?.[sentence.id] : undefined,
  )

  const baseLayers = useMemo(() => {
    if (!sentence) return []
    return computeLayerSnapshot(sentence, typedLength)
  }, [sentence, typedLength])

  const panelFallback = useActivePanelSceneEdit(bookId, baseLayers)

  const [mediaReady, setMediaReady] = useState(false)
  const [resolvedLayers, setResolvedLayers] = useState<LayerState[]>(baseLayers)
  const mediaGen = useRef(0)

  const stageFx = useMemo(() => {
    if (!timeline) {
      return panelFallback
        ? {
            sceneTransition: panelFallback.transition,
            stagingEffect: panelFallback.staging,
            masterTextOverlay: panelFallback.textOverlay?.text.trim()
              ? panelFallback.textOverlay
              : null,
          }
        : {
            sceneTransition: 'crossfade' as const,
            stagingEffect: 'none' as const,
            masterTextOverlay: null,
          }
    }
    return resolveTimelineStageFx(timeline, typedLength, panelFallback)
  }, [timeline, typedLength, panelFallback])

  useEffect(() => {
    if (!timeline || !sentence) {
      setResolvedLayers(baseLayers)
      setMediaReady(true)
      return
    }

    const gen = ++mediaGen.current
    setMediaReady(false)

    void (async () => {
      const media = await resolveTimelineMedia(timeline, typedLength)
      if (gen !== mediaGen.current) return
      const next = applyTimelineToLayers(baseLayers, timeline, typedLength, media)
      setResolvedLayers(next)
      setMediaReady(true)
    })()
  }, [timeline, sentence, typedLength, baseLayers])

  return {
    layers: timeline ? resolvedLayers : baseLayers,
    stageFx,
    mediaReady,
  }
}
