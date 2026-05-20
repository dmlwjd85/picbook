import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PICBOOK_CATALOG } from '../data/picbookCatalog'
import { extractPanelUrlsFromSentence } from '../lib/extractPanelUrls'
import { panelKeyFromImageUrl } from '../lib/panelKey'
import { computeLayerSnapshot } from '../lib/cueEngine'
import { makeTimelineMediaKey, putTimelineAudio, putTimelineImage } from '../lib/timelineMediaDb'
import { activeInsert as pickActiveInsert, mergeFrameEditsUpTo } from '../lib/mergeFrameEdits'
import { usePicbookSceneEditStore } from '../state/picbookSceneEditStore'
import { usePicbookTimelineStore } from '../state/picbookTimelineStore'
import { useTimelinePlayback } from '../hooks/useTimelinePlayback'
import {
  SCENE_STAGING_OPTIONS,
  SCENE_TRANSITION_OPTIONS,
  TEXT_OVERLAY_POSITION_OPTIONS,
  type SceneStaging,
  type SceneTransition,
  type TextOverlayPosition,
} from '../types/sceneEdit'
import type { ReadingPack } from '../types/pack'
import { EditablePreviewStage, type PreviewSelectTarget } from './EditablePreviewStage'
import { PremiereTimeline } from './PremiereTimeline'
import { EditorDeployBar } from './EditorDeployBar'
import { createId } from '../lib/ids'

const AVAILABLE_BOOKS = PICBOOK_CATALOG.filter((b) => !b.comingSoon)

function panelLabel(url: string, index: number): string {
  const key = panelKeyFromImageUrl(url)
  const file = key.split('/').pop() ?? key
  return `${index + 1}컷 · ${file}`
}

export function PicbookSceneEditor() {
  const [bookId, setBookId] = useState(AVAILABLE_BOOKS[0]?.id ?? '')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [previewSelect, setPreviewSelect] = useState<PreviewSelectTarget>(null)
  const playRef = useRef<number | null>(null)

  const book = AVAILABLE_BOOKS.find((b) => b.id === bookId)
  const pack: ReadingPack | null = useMemo(() => (book ? book.loadPack() : null), [book])
  const sentence = pack?.sentences[sentenceIndex]

  const timelineRaw = usePicbookTimelineStore((s) =>
    bookId && sentence ? s.byBook[bookId]?.[sentence.id] : undefined,
  )
  const setFrameEdit = usePicbookTimelineStore((s) => s.setFrameEdit)
  const clearFrameAt = usePicbookTimelineStore((s) => s.clearFrameAt)
  const addInsert = usePicbookTimelineStore((s) => s.addInsert)
  const updateInsert = usePicbookTimelineStore((s) => s.updateInsert)
  const removeInsert = usePicbookTimelineStore((s) => s.removeInsert)
  const setBgm = usePicbookTimelineStore((s) => s.setBgm)
  const clearSentence = usePicbookTimelineStore((s) => s.clearSentence)
  const clearBook = usePicbookTimelineStore((s) => s.clearBook)
  const bookTimelines = usePicbookTimelineStore((s) => s.byBook[bookId] ?? {})
  const setPanelEdit = usePicbookSceneEditStore((s) => s.setPanelEdit)

  const timeline = timelineRaw ?? null

  const panelUrls = useMemo(
    () => (sentence ? extractPanelUrlsFromSentence(sentence) : []),
    [sentence],
  )

  const maxFrame = sentence?.text.length ?? 0
  const safeFrame = Math.min(Math.max(0, frameIndex), maxFrame)

  const { layers, stageFx } = useTimelinePlayback(bookId, sentence, safeFrame)

  const mergedFrame = useMemo(
    () => (timeline ? mergeFrameEditsUpTo(timeline, safeFrame) : {}),
    [timeline, safeFrame],
  )

  const editedIndices = useMemo(() => {
    if (!timeline) return new Set<number>()
    return new Set(Object.keys(timeline.frameEdits).map(Number))
  }, [timeline])

  const insertAfterIndices = useMemo(() => {
    if (!timeline) return new Set<number>()
    return new Set(timeline.inserts.map((i) => i.afterCharIndex))
  }, [timeline])

  const activeInsertCut = timeline ? pickActiveInsert(timeline, safeFrame) : null

  const baseLayersAtFrame = useMemo(() => {
    if (!sentence) return []
    return computeLayerSnapshot(sentence, safeFrame)
  }, [sentence, safeFrame])

  const defaultPanelUrl = useMemo(() => {
    const vis = baseLayersAtFrame.filter((l) => l.visible && l.imageUrl && l.fillHeight)
    return vis[vis.length - 1]?.imageUrl ?? panelUrls[0] ?? null
  }, [baseLayersAtFrame, panelUrls])

  const stopPlay = useCallback(() => {
    if (playRef.current != null) {
      window.clearInterval(playRef.current)
      playRef.current = null
    }
    setPlaying(false)
  }, [])

  const startPlay = useCallback(() => {
    stopPlay()
    setPlaying(true)
    setFrameIndex(0)
    playRef.current = window.setInterval(() => {
      setFrameIndex((f) => {
        if (f >= maxFrame) {
          stopPlay()
          return f
        }
        return f + 1
      })
    }, 420)
  }, [maxFrame, stopPlay])

  useEffect(() => () => stopPlay(), [stopPlay])

  useEffect(() => {
    setPreviewSelect(null)
  }, [bookId, sentenceIndex, safeFrame])

  const previewScale =
    previewSelect === 'insert' && activeInsertCut
      ? (activeInsertCut.scale ?? 1)
      : (mergedFrame.scale ?? 1)
  const previewPanX =
    previewSelect === 'insert' && activeInsertCut
      ? (activeInsertCut.panX ?? 0)
      : (mergedFrame.panX ?? 0)
  const previewPanY =
    previewSelect === 'insert' && activeInsertCut
      ? (activeInsertCut.panY ?? 0)
      : (mergedFrame.panY ?? 0)

  const hasMainVisual =
    Boolean(mergedFrame.imageUrl || mergedFrame.customImageId) || layers.some((l) => l.visible && l.imageUrl)
  const hasInsertVisual = Boolean(
    activeInsertCut && (activeInsertCut.imageUrl || activeInsertCut.customImageId),
  )

  const onPickFrameImage = async (file: File | null) => {
    if (!file || !bookId || !sentence) return
    if (!file.type.startsWith('image/')) {
      window.alert('이미지 파일만 넣을 수 있습니다.')
      return
    }
    const key = makeTimelineMediaKey(bookId, sentence.id, `frame-${safeFrame}-${createId()}`)
    await putTimelineImage(key, file)
    setFrameEdit(bookId, sentence.id, safeFrame, { customImageId: key, imageUrl: undefined })
  }

  const onPickInsertImage = async (insertId: string, file: File | null) => {
    if (!file || !bookId || !sentence) return
    const key = makeTimelineMediaKey(bookId, sentence.id, `ins-${insertId}`)
    await putTimelineImage(key, file)
    updateInsert(bookId, sentence.id, insertId, { customImageId: key, imageUrl: undefined })
  }

  const onPickSfx = async (file: File | null) => {
    if (!file || !bookId || !sentence) return
    const key = makeTimelineMediaKey(bookId, sentence.id, `sfx-${safeFrame}-${createId()}`)
    await putTimelineAudio(key, file)
    setFrameEdit(bookId, sentence.id, safeFrame, {
      sfx: { customAudioId: key, volume: mergedFrame.sfx?.volume ?? 0.85 },
    })
  }

  const onPickBgm = async (file: File | null) => {
    if (!file || !bookId || !sentence) return
    const key = makeTimelineMediaKey(bookId, sentence.id, 'bgm')
    await putTimelineAudio(key, file)
    setBgm(bookId, sentence.id, {
      customAudioId: key,
      volume: timeline?.bgm?.volume ?? 0.35,
      loop: true,
    })
  }

  if (!book || !pack) {
    return <p className="text-sm text-slate-600">편집할 픽북이 없습니다.</p>
  }

  if (!sentence) {
    return <p className="text-sm text-slate-600">문장을 선택해 주세요.</p>
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-900">PicBook 타임라인 연출 편집</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          한 글자마다 프레임을 두고, 그 순간의 그림·줌·전환·효과음·삽입 컷을 다룹니다. 저장·배포 시 Firebase에 올리면 모든
          기기 재생에 반영됩니다. 미리보기에서 이미지를 눌러 크기 조절·삭제할 수 있습니다.
        </p>
        <div className="mt-3">
          <EditorDeployBar bookId={bookId} bookTitle={book.title} timelines={bookTimelines} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">픽북·문장</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVAILABLE_BOOKS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBookId(b.id)
                setSentenceIndex(0)
                setFrameIndex(0)
                stopPlay()
              }}
              className={chipCls(b.id === bookId)}
            >
              {b.title}
            </button>
          ))}
        </div>
        {pack.sentences.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {pack.sentences.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSentenceIndex(i)
                  setFrameIndex(0)
                  stopPlay()
                }}
                className={chipCls(i === sentenceIndex)}
              >
                {i + 1}. {s.text.slice(0, 14)}
                {s.text.length > 14 ? '…' : ''}
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            className="text-xs font-semibold text-rose-600 hover:underline"
            onClick={() => {
              if (window.confirm(`이 문장 타임라인을 지울까요?`)) clearSentence(bookId, sentence.id)
            }}
          >
            이 문장 타임라인 초기화
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-rose-600 hover:underline"
            onClick={() => {
              if (window.confirm(`「${book.title}」 타임라인 전체를 지울까요?`)) clearBook(bookId)
            }}
          >
            픽북 타임라인 전체 초기화
          </button>
        </div>
      </section>

      {/* 미리보기 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">미리 보기</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-indigo-700">
              {safeFrame} / {maxFrame} 글자
            </span>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700"
              onClick={() => (playing ? stopPlay() : startPlay())}
            >
              {playing ? '정지' : '▶ 재생'}
            </button>
          </div>
        </div>
        <label className="mt-2 block text-xs text-slate-600">
          재생 위치(글자 수)
          <input
            type="range"
            min={0}
            max={maxFrame}
            value={safeFrame}
            className="mt-1 block w-full"
            onChange={(e) => {
              stopPlay()
              setFrameIndex(Number(e.target.value))
            }}
          />
        </label>
        <div className="mt-3">
          <EditablePreviewStage
            layers={layers}
            stageFx={stageFx}
            centerImages
            scale={previewScale}
            panX={previewPanX}
            panY={previewPanY}
            hasMainEdit={hasMainVisual}
            hasInsert={hasInsertVisual}
            selectTarget={previewSelect}
            onSelectTarget={setPreviewSelect}
            onScaleChange={(s) => {
              if (previewSelect === 'insert' && activeInsertCut) {
                updateInsert(bookId, sentence.id, activeInsertCut.id, { scale: s })
              } else {
                setFrameEdit(bookId, sentence.id, safeFrame, { scale: s })
              }
            }}
            onPanChange={(px, py) => {
              if (previewSelect === 'insert' && activeInsertCut) {
                updateInsert(bookId, sentence.id, activeInsertCut.id, { panX: px, panY: py })
              } else {
                setFrameEdit(bookId, sentence.id, safeFrame, { panX: px, panY: py })
              }
            }}
            onDeleteMain={() => clearFrameAt(bookId, sentence.id, safeFrame)}
            onDeleteInsert={() => {
              if (activeInsertCut) removeInsert(bookId, sentence.id, activeInsertCut.id)
            }}
          />
        </div>
      </section>

      {/* 타임라인 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">프리미어 타임라인</h2>
        <p className="mt-1 text-xs text-slate-500">{sentence.text}</p>
        <div className="mt-3">
          <PremiereTimeline
            text={sentence.text}
            maxFrame={maxFrame}
            selectedIndex={safeFrame}
            timeline={timeline}
            editedIndices={editedIndices}
            insertAfterIndices={insertAfterIndices}
            onSelect={(i) => {
              stopPlay()
              setFrameIndex(i)
            }}
          />
        </div>
      </section>

      {/* 인스펙터 */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            프레임 {safeFrame} · 그림·줌
          </h2>

          {panelUrls.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-600">패널에서 고르기(이 프레임부터 교체)</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {panelUrls.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() =>
                      setFrameEdit(bookId, sentence.id, safeFrame, {
                        imageUrl: url,
                        customImageId: undefined,
                      })
                    }
                    className="overflow-hidden rounded-lg border border-slate-200 hover:ring-2 hover:ring-indigo-300"
                  >
                    <img src={url} alt="" className="aspect-[3/2] w-full object-cover" />
                    <span className="block bg-slate-50 py-0.5 text-center text-[9px]">{i + 1}컷</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <label className="mt-3 block text-xs font-medium text-slate-600">
            내 컴퓨터에서 그림 넣기·교체
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs"
              onChange={(e) => {
                void onPickFrameImage(e.target.files?.[0] ?? null)
                e.target.value = ''
              }}
            />
          </label>

          <label className="mt-3 block text-xs font-medium text-slate-600">
            그림 주소(URL)
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="https://..."
              value={mergedFrame.imageUrl ?? ''}
              onChange={(e) =>
                setFrameEdit(bookId, sentence.id, safeFrame, {
                  imageUrl: e.target.value.trim() || undefined,
                  customImageId: undefined,
                })
              }
            />
          </label>

          <label className="mt-3 block text-xs font-medium text-slate-600">
            확대 배율 ({mergedFrame.scale ?? 1})
            <input
              type="range"
              min={0.6}
              max={2}
              step={0.05}
              value={mergedFrame.scale ?? 1}
              className="mt-1 block w-full"
              onChange={(e) =>
                setFrameEdit(bookId, sentence.id, safeFrame, { scale: Number(e.target.value) })
              }
            />
          </label>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <FieldRange
              label="가로 이동 %"
              value={mergedFrame.panX ?? 0}
              min={-30}
              max={30}
              onChange={(v) => setFrameEdit(bookId, sentence.id, safeFrame, { panX: v })}
            />
            <FieldRange
              label="세로 이동 %"
              value={mergedFrame.panY ?? 0}
              min={-30}
              max={30}
              onChange={(v) => setFrameEdit(bookId, sentence.id, safeFrame, { panY: v })}
            />
          </div>

          {defaultPanelUrl ? (
            <button
              type="button"
              className="mt-3 text-xs text-slate-600 hover:underline"
              onClick={() => {
                setPanelEdit(bookId, defaultPanelUrl, {
                  transition: mergedFrame.transition,
                  staging: mergedFrame.staging,
                })
                window.alert('현재 프레임 설정을 이 컷의 기본 연출(패널)에도 복사했습니다.')
              }}
            >
              이 프레임 전환·무대를 패널 기본값으로 복사
            </button>
          ) : null}

          <button
            type="button"
            className="mt-2 block text-xs font-semibold text-rose-600 hover:underline"
            onClick={() => clearFrameAt(bookId, sentence.id, safeFrame)}
          >
            이 프레임 편집 지우기
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">전환·무대·자막</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SelectField
                label="화면 전환"
                value={mergedFrame.transition ?? 'crossfade'}
                options={SCENE_TRANSITION_OPTIONS}
                onChange={(v) =>
                  setFrameEdit(bookId, sentence.id, safeFrame, { transition: v as SceneTransition })
                }
              />
              <SelectField
                label="무대 효과"
                value={mergedFrame.staging ?? 'none'}
                options={SCENE_STAGING_OPTIONS}
                onChange={(v) =>
                  setFrameEdit(bookId, sentence.id, safeFrame, { staging: v as SceneStaging })
                }
              />
            </div>
            <input
              type="text"
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="짧은 자막 (선택)"
              value={mergedFrame.textOverlay?.text ?? ''}
              onChange={(e) =>
                setFrameEdit(bookId, sentence.id, safeFrame, {
                  textOverlay: {
                    text: e.target.value,
                    position: mergedFrame.textOverlay?.position ?? 'top',
                  },
                })
              }
            />
            <SelectField
              label="자막 위치"
              value={mergedFrame.textOverlay?.position ?? 'top'}
              options={TEXT_OVERLAY_POSITION_OPTIONS}
              onChange={(v) =>
                setFrameEdit(bookId, sentence.id, safeFrame, {
                  textOverlay: {
                    text: mergedFrame.textOverlay?.text ?? '',
                    position: v as TextOverlayPosition,
                  },
                })
              }
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">소리</h2>
            <label className="mt-2 block text-xs font-medium text-slate-600">
              이 프레임 효과음 (mp3/wav)
              <input
                type="file"
                accept="audio/*"
                className="mt-1 block w-full text-xs"
                onChange={(e) => {
                  void onPickSfx(e.target.files?.[0] ?? null)
                  e.target.value = ''
                }}
              />
            </label>
            <label className="mt-2 block text-xs font-medium text-slate-600">
              효과음 URL
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                placeholder="https://..."
                value={mergedFrame.sfx?.url ?? ''}
                onChange={(e) =>
                  setFrameEdit(bookId, sentence.id, safeFrame, {
                    sfx: { ...mergedFrame.sfx, url: e.target.value.trim() || undefined },
                  })
                }
              />
            </label>
            <hr className="my-3 border-slate-100" />
            <label className="block text-xs font-medium text-slate-600">
              배경음(BGM) 파일
              <input
                type="file"
                accept="audio/*"
                className="mt-1 block w-full text-xs"
                onChange={(e) => {
                  void onPickBgm(e.target.files?.[0] ?? null)
                  e.target.value = ''
                }}
              />
            </label>
            <label className="mt-2 block text-xs font-medium text-slate-600">
              BGM URL
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                value={timeline?.bgm?.url ?? ''}
                onChange={(e) =>
                  setBgm(bookId, sentence.id, {
                    url: e.target.value.trim() || undefined,
                    volume: timeline?.bgm?.volume ?? 0.35,
                    loop: true,
                  })
                }
              />
            </label>
            {timeline?.bgm ? (
              <button
                type="button"
                className="mt-2 text-xs text-rose-600 hover:underline"
                onClick={() => setBgm(bookId, sentence.id, null)}
              >
                BGM 제거
              </button>
            ) : null}
          </div>

          <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/50 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-fuchsia-900">글자 사이 삽입 컷</h2>
            <p className="mt-1 text-xs text-fuchsia-800/80">
              선택한 프레임 글자 <strong>바로 뒤</strong>부터 삽입 그림이 겹쳐 보입니다.
            </p>
            <button
              type="button"
              className="mt-2 rounded-lg bg-fuchsia-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-fuchsia-700"
              onClick={() => {
                const after = Math.max(0, safeFrame - 1)
                addInsert(bookId, sentence.id, after)
              }}
            >
              「{safeFrame > 0 ? sentence.text[safeFrame - 1] : '시작'}」 뒤에 삽입 추가
            </button>

            {timeline?.inserts.map((ins) => (
              <div key={ins.id} className="mt-3 rounded-lg border border-fuchsia-200 bg-white p-3">
                <p className="text-xs font-semibold text-fuchsia-900">
                  {ins.afterCharIndex}글자 뒤 ~ (입력 &gt; {ins.afterCharIndex})
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-xs"
                  onChange={(e) => {
                    void onPickInsertImage(ins.id, e.target.files?.[0] ?? null)
                    e.target.value = ''
                  }}
                />
                <FieldRange
                  label="삽입 확대"
                  value={ins.scale ?? 1}
                  min={0.6}
                  max={2}
                  step={0.05}
                  onChange={(v) => updateInsert(bookId, sentence.id, ins.id, { scale: v })}
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-rose-600 hover:underline"
                  onClick={() => removeInsert(bookId, sentence.id, ins.id)}
                >
                  삽입 삭제
                </button>
              </div>
            ))}

            {activeInsertCut ? (
              <p className="mt-2 text-[10px] text-fuchsia-700">현재 프레임에서 삽입 컷이 활성입니다.</p>
            ) : null}
          </div>
        </div>
      </section>

      {defaultPanelUrl ? (
        <p className="text-[10px] text-slate-400">
          기준 패널: {panelLabel(defaultPanelUrl, panelUrls.indexOf(defaultPanelUrl))}
        </p>
      ) : null}
    </div>
  )
}

function chipCls(active: boolean): string {
  return [
    'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
    active
      ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
  ].join(' ')
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <select
        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function FieldRange({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (n: number) => void
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}: {value}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="mt-1 block w-full"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}
