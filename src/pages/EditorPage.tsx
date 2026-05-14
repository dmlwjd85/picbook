import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { computeLayerSnapshot } from '../lib/cueEngine'
import { summarizeEffect } from '../lib/cueLabels'
import { parsePackJson } from '../lib/parsePack'
import { usePackEditorStore } from '../state/packEditorStore'
import type { CueEffect } from '../types/pack'
import { VisualStage } from '../components/VisualStage'

export default function EditorPage() {
  const pack = usePackEditorStore((s) => s.pack)
  const activeSentenceIndex = usePackEditorStore((s) => s.activeSentenceIndex)
  const setActiveSentenceIndex = usePackEditorStore((s) => s.setActiveSentenceIndex)
  const replacePack = usePackEditorStore((s) => s.replacePack)
  const resetToSample = usePackEditorStore((s) => s.resetToSample)
  const updateMeta = usePackEditorStore((s) => s.updateMeta)
  const addSentence = usePackEditorStore((s) => s.addSentence)
  const removeSentence = usePackEditorStore((s) => s.removeSentence)
  const updateSentenceText = usePackEditorStore((s) => s.updateSentenceText)
  const addLayer = usePackEditorStore((s) => s.addLayer)
  const updateLayer = usePackEditorStore((s) => s.updateLayer)
  const removeLayer = usePackEditorStore((s) => s.removeLayer)
  const addCue = usePackEditorStore((s) => s.addCue)
  const updateCue = usePackEditorStore((s) => s.updateCue)
  const removeCue = usePackEditorStore((s) => s.removeCue)
  const appendCueEffect = usePackEditorStore((s) => s.appendCueEffect)
  const removeCueEffect = usePackEditorStore((s) => s.removeCueEffect)
  const exportJsonString = usePackEditorStore((s) => s.exportJsonString)

  const sentence = pack.sentences[activeSentenceIndex]
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewLen, setPreviewLen] = useState(0)

  const previewLayers = useMemo(() => {
    if (!sentence) return []
    const max = sentence.text.length
    const len = Math.max(0, Math.min(previewLen, max))
    return computeLayerSnapshot(sentence, len)
  }, [sentence, previewLen])

  const defaultLayerId = sentence?.layers[0]?.id ?? ''

  useEffect(() => {
    setPreviewLen((n) => Math.min(n, sentence.text.length))
  }, [sentence.id, sentence.text.length])

  const onImport = useCallback(
    (file: File | null) => {
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const t = typeof reader.result === 'string' ? reader.result : ''
        const parsed = parsePackJson(t)
        if (!parsed.ok) {
          window.alert(parsed.error)
          return
        }
        replacePack(parsed.pack)
      }
      reader.readAsText(file, 'utf-8')
    },
    [replacePack],
  )

  const downloadExport = useCallback(() => {
    const blob = new Blob([exportJsonString()], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pack.id || 'picbook-pack'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportJsonString, pack.id])

  const onLayerImageFile = (sentenceId: string, layerId: string, file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : null
      if (url) updateLayer(sentenceId, layerId, { imageUrl: url })
    }
    reader.readAsDataURL(file)
  }

  if (!sentence) {
    return <div className="p-6">문장이 없습니다.</div>
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/" className="text-xs font-medium text-indigo-600 hover:underline">
              ← 홈
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">편집자 — 팩 만들기</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => resetToSample()}
            >
              샘플로 초기화
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0] ?? null)} />
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => fileRef.current?.click()}
            >
              JSON 가져오기
            </button>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              onClick={downloadExport}
            >
              JSON 보내기
            </button>
            <Link
              to="/player"
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              사용자 화면에서 테스트
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">팩 정보</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-slate-500">
              제목
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={pack.title}
                onChange={(e) => updateMeta({ title: e.target.value })}
              />
            </label>
            <label className="block text-xs text-slate-500">
              저자
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={pack.author}
                onChange={(e) => updateMeta({ author: e.target.value })}
              />
            </label>
            <label className="col-span-full block text-xs text-slate-500">
              설명
              <textarea
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={pack.description}
                onChange={(e) => updateMeta({ description: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">문장 목록</h2>
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800" onClick={() => addSentence()}>
              문장 추가
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {pack.sentences.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSentenceIndex(i)}
                className={[
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  i === activeSentenceIndex ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-slate-50 text-slate-700',
                ].join(' ')}
              >
                {i + 1}. {s.text.slice(0, 18)}
                {s.text.length > 18 ? '…' : ''}
              </button>
            ))}
          </div>
          {pack.sentences.length > 1 ? (
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-rose-600 hover:underline"
              onClick={() => {
                if (window.confirm('이 문장 블록을 삭제할까요?')) removeSentence(sentence.id)
              }}
            >
              현재 문장 삭제
            </button>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">문장 본문</h2>
          <textarea
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed"
            value={sentence.text}
            onChange={(e) => updateSentenceText(sentence.id, e.target.value)}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">레이어 (이미지 겹침 순서 = zIndex)</h2>
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50" onClick={() => addLayer(sentence.id)}>
              레이어 추가
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {sentence.layers.map((layer) => (
              <div key={layer.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="text-xs text-slate-500">
                    라벨
                    <input className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm" value={layer.label} onChange={(e) => updateLayer(sentence.id, layer.id, { label: e.target.value })} />
                  </label>
                  <label className="text-xs text-slate-500">
                    zIndex
                    <input
                      type="number"
                      className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                      value={layer.zIndex}
                      onChange={(e) => updateLayer(sentence.id, layer.id, { zIndex: Number(e.target.value) || 0 })}
                    />
                  </label>
                  <label className="text-xs text-slate-500 sm:col-span-2">
                    이미지 URL
                    <input
                      className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                      value={layer.imageUrl ?? ''}
                      placeholder="https://..."
                      onChange={(e) => updateLayer(sentence.id, layer.id, { imageUrl: e.target.value || null })}
                    />
                  </label>
                  <label className="text-xs text-slate-500">
                    파일
                    <input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={(e) => onLayerImageFile(sentence.id, layer.id, e.target.files?.[0] ?? null)} />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 sm:col-span-3">
                    <input type="checkbox" checked={layer.visible} onChange={(e) => updateLayer(sentence.id, layer.id, { visible: e.target.checked })} />
                    문장 시작 시 보이기(초기 상태)
                  </label>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-5">
                  {(['x', 'y', 'width', 'scale', 'opacity'] as const).map((key) => (
                    <label key={key} className="text-xs text-slate-500">
                      {key}
                      <input
                        type="number"
                        step={key === 'opacity' ? 0.05 : 1}
                        className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        value={layer[key]}
                        onChange={(e) => updateLayer(sentence.id, layer.id, { [key]: Number(e.target.value) } as Partial<typeof layer>)}
                      />
                    </label>
                  ))}
                </div>
                <button type="button" className="mt-2 text-xs font-semibold text-rose-600 hover:underline" onClick={() => removeLayer(sentence.id, layer.id)}>
                  레이어 삭제
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">타이밍 큐 (선두 일치 글자 수)</h2>
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50" onClick={() => addCue(sentence.id, 0)}>
              큐 추가
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            글자 수가 해당 값 이상이 되면 큐가 적용됩니다. 같은 글자 수에 여러 큐가 있으면 편집기에 넣은 순서대로 적용됩니다.
          </p>
          <div className="mt-4 space-y-4">
            {[...sentence.cues]
              .map((c, order) => ({ c, order }))
              .sort((a, b) => (a.c.charIndex !== b.c.charIndex ? a.c.charIndex - b.c.charIndex : a.order - b.order))
              .map(({ c: cue }) => (
                <div key={cue.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs text-slate-500">
                      charIndex
                      <input
                        type="number"
                        min={0}
                        className="ml-1 w-20 rounded border border-slate-200 px-2 py-1 text-sm"
                        value={cue.charIndex}
                        onChange={(e) => updateCue(sentence.id, cue.id, { charIndex: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    </label>
                    <CueEffectToolbar
                      layerIds={sentence.layers.map((l) => l.id)}
                      defaultLayerId={defaultLayerId}
                      onAdd={(effect) => appendCueEffect(sentence.id, cue.id, effect)}
                    />
                    <button type="button" className="ml-auto text-xs text-rose-600 hover:underline" onClick={() => removeCue(sentence.id, cue.id)}>
                      큐 삭제
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">
                    {cue.effects.map((eff, idx) => (
                      <li key={`${cue.id}-${idx}`} className="flex items-center justify-between gap-2 rounded bg-white px-2 py-1 ring-1 ring-slate-100">
                        <span>{summarizeEffect(eff)}</span>
                        <button type="button" className="text-rose-600 hover:underline" onClick={() => removeCueEffect(sentence.id, cue.id, idx)}>
                          제거
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">미리보기 (타이핑 길이 시뮬레이션)</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-xs text-slate-500">
              글자 수 {previewLen} / {sentence.text.length}
              <input
                type="range"
                min={0}
                max={Math.max(0, sentence.text.length)}
                value={previewLen}
                className="mt-1 block w-48"
                onChange={(e) => setPreviewLen(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="mt-4">
            <VisualStage layers={previewLayers} />
          </div>
        </section>
      </div>
    </div>
  )
}

function CueEffectToolbar({
  layerIds,
  defaultLayerId,
  onAdd,
}: {
  layerIds: string[]
  defaultLayerId: string
  onAdd: (e: CueEffect) => void
}) {
  const [pick, setPick] = useState(defaultLayerId || layerIds[0] || '')

  const layer = pick || layerIds[0]
  if (layerIds.length === 0) {
    return <span className="text-xs text-amber-600">레이어를 먼저 추가하세요.</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <select className="rounded border border-slate-200 bg-white px-2 py-1 text-xs" value={pick} onChange={(e) => setPick(e.target.value)}>
        {layerIds.map((id) => (
          <option key={id} value={id}>
            {id.slice(0, 8)}…
          </option>
        ))}
      </select>
      <button type="button" className="rounded bg-white px-2 py-1 text-xs ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => layer && onAdd({ kind: 'layerShow', layerId: layer })}>
        보이기
      </button>
      <button type="button" className="rounded bg-white px-2 py-1 text-xs ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => layer && onAdd({ kind: 'layerHide', layerId: layer })}>
        숨기기
      </button>
      <button
        type="button"
        className="rounded bg-white px-2 py-1 text-xs ring-1 ring-slate-200 hover:bg-slate-50"
        onClick={() => {
          if (!layer) return
          const url = window.prompt('이미지 URL', 'https://')
          if (url) onAdd({ kind: 'layerImage', layerId: layer, imageUrl: url.trim() })
        }}
      >
        이미지 지정
      </button>
      <button
        type="button"
        className="rounded bg-white px-2 py-1 text-xs ring-1 ring-slate-200 hover:bg-slate-50"
        onClick={() => {
          if (!layer) return
          const v = window.prompt('투명도 0~1', '1')
          if (v === null) return
          const n = Number(v)
          if (!Number.isFinite(n)) return
          onAdd({ kind: 'layerOpacity', layerId: layer, opacity: Math.max(0, Math.min(1, n)) })
        }}
      >
        투명도
      </button>
      <button
        type="button"
        className="rounded bg-white px-2 py-1 text-xs ring-1 ring-slate-200 hover:bg-slate-50"
        onClick={() => {
          if (!layer) return
          const x = window.prompt('x (%)', '10')
          if (x === null) return
          onAdd({ kind: 'layerTransform', layerId: layer, x: Number(x) })
        }}
      >
        위치x
      </button>
    </div>
  )
}
