import { useMemo, useRef } from 'react'
import type { SentenceTimeline } from '../types/timeline'
import { PicbookTimelineStrip } from './PicbookTimelineStrip'

const PX_PER_FRAME = 14

type Props = {
  text: string
  maxFrame: number
  selectedIndex: number
  timeline: SentenceTimeline | null
  editedIndices: Set<number>
  insertAfterIndices: Set<number>
  onSelect: (index: number) => void
}

/** 프리미어 스타일 멀티트랙 타임라인 */
export function PremiereTimeline({
  text,
  maxFrame,
  selectedIndex,
  timeline,
  editedIndices,
  insertAfterIndices,
  onSelect,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const width = (maxFrame + 1) * PX_PER_FRAME + 24

  const sfxFrames = useMemo(() => {
    if (!timeline) return new Set<number>()
    const s = new Set<number>()
    for (const [k, fe] of Object.entries(timeline.frameEdits)) {
      if (fe.sfx?.url || fe.sfx?.customAudioId) s.add(Number(k))
    }
    return s
  }, [timeline])

  const insertBlocks = useMemo(() => {
    if (!timeline) return [] as { id: string; start: number; end: number }[]
    const sorted = [...timeline.inserts].sort((a, b) => a.afterCharIndex - b.afterCharIndex)
    return sorted.map((ins, i) => {
      const start = ins.afterCharIndex + 1
      const next = sorted[i + 1]
      const end = next ? next.afterCharIndex + 1 : maxFrame + 1
      return { id: ins.id, start, end }
    })
  }, [timeline, maxFrame])

  const onRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - 12
    const frame = Math.round(x / PX_PER_FRAME)
    onSelect(Math.min(maxFrame, Math.max(0, frame)))
  }

  return (
    <div className="premiere-timeline">
      <p className="mb-2 text-[10px] text-slate-500">
        프리미어 타임라인 — 눈금·클립 클릭으로 이동 · V1 그림 · V2 삽입 · A1 효과음 · A2 BGM
      </p>
      <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
        <div className="flex w-16 shrink-0 flex-col border-r border-slate-700 bg-slate-800 text-[9px] font-bold text-slate-300">
          <div className="h-6 border-b border-slate-700" />
          <TrackLabel>V1 그림</TrackLabel>
          <TrackLabel>V2 삽입</TrackLabel>
          <TrackLabel>A1 효과음</TrackLabel>
          <TrackLabel>A2 BGM</TrackLabel>
        </div>
        <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto">
          <div style={{ width }} className="relative">
            <div
              className="relative h-6 cursor-crosshair border-b border-slate-700 bg-slate-950"
              onClick={onRulerClick}
              role="slider"
              aria-valuenow={selectedIndex}
              aria-valuemin={0}
              aria-valuemax={maxFrame}
            >
              {Array.from({ length: maxFrame + 1 }, (_, i) => (
                <span
                  key={i}
                  className="absolute top-0 border-l border-slate-600/80 text-[8px] text-slate-500"
                  style={{ left: 12 + i * PX_PER_FRAME }}
                >
                  {i % 5 === 0 ? i : ''}
                </span>
              ))}
              <span
                className="premiere-playhead absolute top-0 z-10 h-full w-0.5 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]"
                style={{ left: 12 + selectedIndex * PX_PER_FRAME }}
              />
            </div>

            <TrackRow height={32}>
              {Array.from(editedIndices).map((fi) => (
                <ClipBlock
                  key={`v-${fi}`}
                  left={12 + fi * PX_PER_FRAME}
                  width={PX_PER_FRAME}
                  color="bg-amber-500/90"
                  title={`프레임 ${fi}`}
                  onClick={() => onSelect(fi)}
                />
              ))}
            </TrackRow>

            <TrackRow height={28}>
              {insertBlocks.map((b) => (
                <ClipBlock
                  key={b.id}
                  left={12 + b.start * PX_PER_FRAME}
                  width={(b.end - b.start) * PX_PER_FRAME}
                  color="bg-fuchsia-500/85"
                  title="삽입 컷"
                  onClick={() => onSelect(b.start)}
                />
              ))}
            </TrackRow>

            <TrackRow height={24}>
              {Array.from(sfxFrames).map((fi) => (
                <button
                  key={`sfx-${fi}`}
                  type="button"
                  className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-lime-400"
                  style={{ left: 12 + fi * PX_PER_FRAME + PX_PER_FRAME / 2 - 4 }}
                  title={`효과음 @${fi}`}
                  onClick={() => onSelect(fi)}
                />
              ))}
            </TrackRow>

            <TrackRow height={22}>
              {timeline?.bgm ? (
                <ClipBlock
                  left={12}
                  width={maxFrame * PX_PER_FRAME + PX_PER_FRAME}
                  color="bg-cyan-600/70"
                  title="BGM"
                  onClick={() => onSelect(0)}
                />
              ) : null}
            </TrackRow>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
        <p className="mb-1 text-[9px] font-medium text-slate-500">글자 프레임 (보조)</p>
        <PicbookTimelineStrip
          text={text}
          selectedIndex={selectedIndex}
          editedIndices={editedIndices}
          insertAfterIndices={insertAfterIndices}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}

function TrackLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-7 items-center border-b border-slate-700/80 px-1 last:border-b-0">{children}</div>
  )
}

function TrackRow({ height, children }: { height: number; children: React.ReactNode }) {
  return (
    <div className="relative border-b border-slate-700/60 bg-slate-900" style={{ height }}>
      {children}
    </div>
  )
}

function ClipBlock({
  left,
  width,
  color,
  title,
  onClick,
}: {
  left: number
  width: number
  color: string
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      className={`absolute top-1 bottom-1 min-w-[4px] rounded-sm ${color} hover:brightness-110`}
      style={{ left, width: Math.max(4, width) }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    />
  )
}
