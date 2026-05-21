import { useCallback, useRef } from 'react'
import type { LayerState } from '../types/pack'
import type { TimelineStageFx } from '../lib/applyTimelinePlayback'
import { VisualStage } from './VisualStage'

export type PreviewSelectTarget = 'main' | 'insert' | null

type Props = {
  layers: LayerState[]
  stageFx: TimelineStageFx
  centerImages: boolean
  /** 속담 등 3:2 재생 비율과 동일하게 */
  aspect32?: boolean
  scale: number
  panX: number
  panY: number
  hasMainEdit: boolean
  hasInsert: boolean
  selectTarget: PreviewSelectTarget
  onSelectTarget: (t: PreviewSelectTarget) => void
  onScaleChange: (scale: number) => void
  onPanChange: (panX: number, panY: number) => void
  onDeleteMain: () => void
  onDeleteInsert: () => void
}

/** 미리보기 — 이미지 클릭 후 크기·삭제 */
export function EditablePreviewStage({
  layers,
  stageFx,
  centerImages,
  aspect32 = false,
  scale,
  panX,
  panY,
  hasMainEdit,
  hasInsert,
  selectTarget,
  onSelectTarget,
  onScaleChange,
  onPanChange,
  onDeleteMain,
  onDeleteInsert,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ kind: 'scale' | 'pan'; startX: number; startY: number; baseScale: number; basePanX: number; basePanY: number } | null>(null)

  const onStageClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.preview-editor-toolbar')) return
    if (hasInsert) onSelectTarget('insert')
    else if (hasMainEdit || layers.some((l) => l.imageUrl)) onSelectTarget('main')
    else onSelectTarget(null)
  }

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current
      if (!d || !wrapRef.current) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      if (d.kind === 'scale') {
        const next = Math.min(2.5, Math.max(0.4, d.baseScale + dx * 0.004))
        onScaleChange(next)
      } else {
        onPanChange(d.basePanX + dx * 0.08, d.basePanY + dy * 0.08)
      }
    },
    [onScaleChange, onPanChange],
  )

  const endDrag = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
  }, [onPointerMove])

  const startDrag = (kind: 'scale' | 'pan', e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    dragRef.current = {
      kind,
      startX: e.clientX,
      startY: e.clientY,
      baseScale: scale,
      basePanX: panX,
      basePanY: panY,
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
  }

  const selected = selectTarget === 'main' || selectTarget === 'insert'

  return (
    <div
      ref={wrapRef}
      className={`relative mx-auto w-full cursor-pointer ${aspect32 ? 'max-w-[min(100%,480px)]' : 'max-w-[min(100%,420px)]'}`}
      onClick={onStageClick}
      role="presentation"
    >
      <VisualStage
        layers={layers}
        centerImages={centerImages}
        compact={aspect32}
        large={aspect32}
        sceneTransition={stageFx.sceneTransition}
        stagingEffect={stageFx.stagingEffect}
        masterTextOverlay={stageFx.masterTextOverlay}
        holdBackdrop={false}
      />
      {selected ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-sky-400 ring-offset-2 ring-offset-transparent"
          aria-hidden
        />
      ) : null}
      {selected ? (
        <div
          className="preview-editor-toolbar pointer-events-auto absolute bottom-2 left-1/2 z-20 flex max-w-[95%] -translate-x-1/2 flex-wrap items-center gap-2 rounded-lg bg-black/85 px-2 py-1.5 text-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-bold text-sky-300">
            {selectTarget === 'insert' ? '삽입 컷' : '본 화면'}
          </span>
          <label className="flex items-center gap-1 text-[10px]">
            크기
            <input
              type="range"
              min={0.4}
              max={2.5}
              step={0.02}
              value={scale}
              onChange={(e) => onScaleChange(Number(e.target.value))}
              className="w-16"
            />
          </label>
          <button
            type="button"
            className="rounded bg-slate-600 px-1.5 py-0.5 text-[10px] font-bold"
            onPointerDown={(e) => startDrag('pan', e)}
          >
            이동
          </button>
          <button
            type="button"
            className="rounded bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold"
            onPointerDown={(e) => startDrag('scale', e)}
          >
            드래그 확대
          </button>
          <button
            type="button"
            className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold"
            onClick={() => {
              if (selectTarget === 'insert') onDeleteInsert()
              else onDeleteMain()
              onSelectTarget(null)
            }}
          >
            삭제
          </button>
          <button type="button" className="text-[10px] text-slate-400" onClick={() => onSelectTarget(null)}>
            닫기
          </button>
        </div>
      ) : (
        <p className="pointer-events-none absolute bottom-1 left-0 right-0 text-center text-[9px] text-white/70">
          미리보기를 눌러 이미지 선택
        </p>
      )}
      {selected ? (
        <div
          className="pointer-events-auto absolute bottom-12 right-2 z-20 h-5 w-5 cursor-se-resize rounded-sm border-2 border-sky-400 bg-sky-400/30"
          onPointerDown={(e) => startDrag('scale', e)}
          title="크기 조절"
        />
      ) : null}
    </div>
  )
}
