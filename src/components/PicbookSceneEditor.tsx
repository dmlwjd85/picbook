import { useMemo, useState } from 'react'
import { PICBOOK_CATALOG } from '../data/picbookCatalog'
import { extractPanelUrlsFromSentence } from '../lib/extractPanelUrls'
import { panelKeyFromImageUrl } from '../lib/panelKey'
import { usePicbookSceneEditStore } from '../state/picbookSceneEditStore'
import {
  SCENE_STAGING_OPTIONS,
  SCENE_TRANSITION_OPTIONS,
  TEXT_OVERLAY_POSITION_OPTIONS,
  type PanelSceneEdit,
  type SceneStaging,
  type SceneTransition,
  type TextOverlayPosition,
} from '../types/sceneEdit'
import type { ReadingPack } from '../types/pack'
import { VisualStage } from './VisualStage'

const AVAILABLE_BOOKS = PICBOOK_CATALOG.filter((b) => !b.comingSoon)

function panelLabel(url: string, index: number): string {
  const key = panelKeyFromImageUrl(url)
  const file = key.split('/').pop() ?? key
  return `${index + 1}컷 · ${file}`
}

function previewLayer(imageUrl: string) {
  return [
    {
      id: 'preview',
      label: '미리보기',
      zIndex: 1,
      imageUrl,
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: 100,
      scale: 1,
      fillHeight: true,
    },
  ]
}

export function PicbookSceneEditor() {
  const [bookId, setBookId] = useState(AVAILABLE_BOOKS[0]?.id ?? '')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [panelIndex, setPanelIndex] = useState(0)

  const getPanelEdit = usePicbookSceneEditStore((s) => s.getPanelEdit)
  const setPanelEdit = usePicbookSceneEditStore((s) => s.setPanelEdit)
  const clearBookEdits = usePicbookSceneEditStore((s) => s.clearBookEdits)

  const book = AVAILABLE_BOOKS.find((b) => b.id === bookId)
  const pack: ReadingPack | null = useMemo(() => (book ? book.loadPack() : null), [book])

  const sentence = pack?.sentences[sentenceIndex]
  const panelUrls = useMemo(
    () => (sentence ? extractPanelUrlsFromSentence(sentence) : []),
    [sentence],
  )

  const safePanelIndex = Math.min(panelIndex, Math.max(0, panelUrls.length - 1))
  const activeUrl = panelUrls[safePanelIndex] ?? null
  const edit: PanelSceneEdit =
    activeUrl && bookId ? getPanelEdit(bookId, activeUrl) : { transition: 'crossfade', staging: 'none' }

  const updateTransition = (transition: SceneTransition) => {
    if (!activeUrl || !bookId) return
    setPanelEdit(bookId, activeUrl, { transition })
  }

  const updateStaging = (staging: SceneStaging) => {
    if (!activeUrl || !bookId) return
    setPanelEdit(bookId, activeUrl, { staging })
  }

  const updateOverlayText = (text: string) => {
    if (!activeUrl || !bookId) return
    setPanelEdit(bookId, activeUrl, {
      textOverlay: { text, position: edit.textOverlay?.position ?? 'top' },
    })
  }

  const updateOverlayPosition = (position: TextOverlayPosition) => {
    if (!activeUrl || !bookId) return
    const text = edit.textOverlay?.text ?? ''
    if (!text.trim()) return
    setPanelEdit(bookId, activeUrl, { textOverlay: { text, position } })
  }

  if (!book || !pack) {
    return <p className="text-sm text-slate-600">편집할 픽북이 없습니다.</p>
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-900">픽북 사진 연출 편집</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          카탈로그에 등록된 PicBook을 고른 뒤, 컷마다 화면 전환·짧은 자막·무대 효과를 설정합니다. 저장은 이 브라우저에만
          되며, 재생 화면에 바로 반영됩니다.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">픽북 선택</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {AVAILABLE_BOOKS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBookId(b.id)
                setSentenceIndex(0)
                setPanelIndex(0)
              }}
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                b.id === bookId
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
              ].join(' ')}
            >
              {b.title}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-rose-600 hover:underline"
          onClick={() => {
            if (window.confirm(`「${book.title}」에 저장한 연출을 모두 지울까요?`)) clearBookEdits(bookId)
          }}
        >
          이 픽북 연출 전체 초기화
        </button>
      </section>

      {pack.sentences.length > 1 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">문장(속담) 선택</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {pack.sentences.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSentenceIndex(i)
                  setPanelIndex(0)
                }}
                className={[
                  'rounded-full border px-3 py-1.5 text-left text-xs font-medium transition',
                  i === sentenceIndex
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                <span className="font-semibold text-indigo-600">{i + 1}</span> · {s.text.slice(0, 18)}
                {s.text.length > 18 ? '…' : ''}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {sentence ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">컷 선택</h2>
          <p className="mt-1 text-xs text-slate-500">{sentence.text}</p>
          {panelUrls.length === 0 ? (
            <p className="mt-3 text-xs text-amber-700">이 문장에서 찾은 그림 컷이 없습니다.</p>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {panelUrls.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPanelIndex(i)}
                  className={[
                    'overflow-hidden rounded-lg border-2 transition',
                    i === safePanelIndex ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300',
                  ].join(' ')}
                >
                  <img src={url} alt="" className="aspect-[3/2] w-full object-cover" />
                  <span className="block bg-slate-50 px-1 py-0.5 text-[9px] font-medium text-slate-600">
                    {i + 1}컷
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeUrl ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">연출 설정 · {panelLabel(activeUrl, safePanelIndex)}</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-600">
                화면 전환
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  value={edit.transition}
                  onChange={(e) => updateTransition(e.target.value as SceneTransition)}
                >
                  {SCENE_TRANSITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-medium text-slate-600">
                무대 효과
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  value={edit.staging}
                  onChange={(e) => updateStaging(e.target.value as SceneStaging)}
                >
                  {SCENE_STAGING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700">짧은 자막 겹치기 (선택)</p>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="예: 말이 고와야…"
                value={edit.textOverlay?.text ?? ''}
                onChange={(e) => updateOverlayText(e.target.value)}
              />
              <label className="block text-xs font-medium text-slate-600">
                자막 위치
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                  value={edit.textOverlay?.position ?? 'top'}
                  onChange={(e) => updateOverlayPosition(e.target.value as TextOverlayPosition)}
                  disabled={!edit.textOverlay?.text?.trim()}
                >
                  {TEXT_OVERLAY_POSITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">미리 보기</h2>
            <p className="mt-1 text-xs text-slate-500">재생 화면과 같은 3:2 비율로 확인합니다.</p>
            <div className="mt-4">
              <VisualStage
                layers={previewLayer(activeUrl)}
                centerImages
                sceneTransition={edit.transition}
                stagingEffect={edit.staging}
                masterTextOverlay={edit.textOverlay?.text.trim() ? edit.textOverlay : null}
              />
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
