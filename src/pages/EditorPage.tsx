import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PicbookSceneEditor } from '../components/PicbookSceneEditor'
import { useMasterAuthStore } from '../state/masterAuthStore'
import { computeLayerSnapshot } from '../lib/cueEngine'
import { getActiveCaption } from '../lib/getActiveCaption'
import { summarizeEffect } from '../lib/cueLabels'
import { parsePackJson } from '../lib/parsePack'
import { usePackEditorStore } from '../state/packEditorStore'
import type { CueEffect, LayerState } from '../types/pack'
import { MasterProductKeysPanel } from '../components/MasterProductKeysPanel'
import { VisualStage } from '../components/VisualStage'

/** 편집 화면 상단: 이미지 파일로 쓸 수 있는 형식 안내 */
function ImageFormatGuide() {
  return (
    <details className="group rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
      <summary className="cursor-pointer font-semibold text-amber-900 outline-none marker:text-amber-700">
        그림 파일은 어떤 종류를 쓸 수 있나요?
      </summary>
      <div className="mt-3 space-y-2 text-xs leading-relaxed text-amber-950/90">
        <p>
          <span className="font-semibold">이 컴퓨터에서 고를 때:</span> 브라우저가 이미지로 인식하는 파일이면 됩니다. 보통{' '}
          <strong>JPG·JPEG, PNG, GIF, WebP, SVG</strong> 는 문제없이 올라갑니다.
        </p>
        <p>
          <span className="font-semibold">인터넷 주소(URL)로 붙일 때:</span> 그 주소가 그림 파일을 바로 보여 주면 됩니다. 위와 비슷한
          확장자가 많습니다. (로그인이 필요한 주소·다운로드 전용 페이지는 안 될 수 있어요.)
        </p>
        <p className="text-amber-900/80">
          <span className="font-semibold">참고:</span> 아이폰 사진의 <strong>HEIC</strong>, 카메라 <strong>RAW</strong> 는 여기서 바로
          안 열릴 수 있으니, JPG나 PNG로 바꾼 뒤 넣어 주세요.
        </p>
      </div>
    </details>
  )
}

type MasterEditorTab = 'picbook' | 'pack'

export default function EditorPage() {
  const navigate = useNavigate()
  const logout = useMasterAuthStore((s) => s.logout)
  const [editorTab, setEditorTab] = useState<MasterEditorTab>('picbook')
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

  const layerName = useMemo(() => {
    const map = new Map<string, string>()
    for (const l of sentence?.layers ?? []) {
      map.set(l.id, l.label?.trim() || `그림 ${l.id.slice(0, 6)}`)
    }
    return (id: string) => map.get(id) ?? id.slice(0, 8)
  }, [sentence?.layers])

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
    if (!file || !file.type.startsWith('image/')) {
      window.alert('이미지 파일만 선택할 수 있습니다. (JPG, PNG 등)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : null
      if (url) updateLayer(sentenceId, layerId, { imageUrl: url })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link to="/bookshelf" className="text-xs font-medium text-indigo-600 hover:underline">
              ← 책장
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">마스터 편집</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              PicBook 사진 연출(전환·자막·무대) 또는 연습 팩 JSON 제작을 선택하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => {
                if (window.confirm('지금 편집 내용을 지우고 예시로 바꿀까요?')) resetToSample()
              }}
            >
              예시로 되돌리기
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0] ?? null)} />
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => fileRef.current?.click()}
            >
              저장 파일 불러오기
            </button>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              onClick={downloadExport}
            >
              저장 파일 내려받기
            </button>
            <Link
              to="/bookshelf"
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              책장에서 테스트
            </Link>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
              onClick={() => {
                logout()
                navigate('/master/login', { replace: true })
              }}
            >
              마스터 로그아웃
            </button>
          </div>
        </header>

        <div className="flex gap-1 rounded-xl bg-slate-200/80 p-1">
          <button
            type="button"
            onClick={() => setEditorTab('picbook')}
            className={[
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition',
              editorTab === 'picbook'
                ? 'bg-white text-indigo-900 shadow'
                : 'text-slate-600 hover:text-slate-900',
            ].join(' ')}
          >
            PicBook 사진 연출
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('pack')}
            className={[
              'flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition',
              editorTab === 'pack'
                ? 'bg-white text-indigo-900 shadow'
                : 'text-slate-600 hover:text-slate-900',
            ].join(' ')}
          >
            연습 팩 만들기
          </button>
        </div>

        {editorTab === 'picbook' ? (
          <PicbookSceneEditor />
        ) : !sentence ? (
          <p className="text-sm text-slate-600">문장이 없습니다. 「연습 팩 만들기」에서 문장을 추가해 주세요.</p>
        ) : (
          <>
        {/* 한눈에 보는 순서 */}
        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-indigo-900">이렇게만 하면 돼요</h2>
          <ol className="mt-3 grid gap-3 text-sm text-slate-800 sm:grid-cols-3">
            <li className="rounded-xl bg-white/90 p-3 ring-1 ring-indigo-100">
              <span className="font-mono text-xs font-bold text-indigo-600">1</span>
              <p className="mt-1 font-medium">연습할 글 쓰기</p>
              <p className="mt-1 text-xs text-slate-600">아래에서 문장을 고르고, 칠 내용을 그대로 적어요.</p>
            </li>
            <li className="rounded-xl bg-white/90 p-3 ring-1 ring-indigo-100">
              <span className="font-mono text-xs font-bold text-indigo-600">2</span>
              <p className="mt-1 font-medium">그림 겹치기</p>
              <p className="mt-1 text-xs text-slate-600">배경·삽화처럼 겹칠 그림을 추가하고, 위치·크기를 맞춰요.</p>
            </li>
            <li className="rounded-xl bg-white/90 p-3 ring-1 ring-indigo-100">
              <span className="font-mono text-xs font-bold text-indigo-600">3</span>
              <p className="mt-1 font-medium">몇 글째에 바뀔지</p>
              <p className="mt-1 text-xs text-slate-600">타자 친 글자 수에 맞춰 그림이 보이거나 바뀌게 순서를 적어요.</p>
            </li>
          </ol>
        </section>

        <MasterProductKeysPanel />
        <ImageFormatGuide />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">이 연습 묶음 소개</h2>
          <p className="mt-1 text-xs text-slate-500">사람들이 파일을 받았을 때 맨 위에 보이는 이름이에요.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600">
              제목
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={pack.title}
                onChange={(e) => updateMeta({ title: e.target.value })}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              만든 사람
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={pack.author}
                onChange={(e) => updateMeta({ author: e.target.value })}
              />
            </label>
            <label className="col-span-full block text-xs font-medium text-slate-600">
              짧은 설명 (선택)
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
            <div>
              <h2 className="text-sm font-semibold text-slate-800">연습할 문장들</h2>
              <p className="mt-0.5 text-xs text-slate-500">한 문장씩 나뉘어 연습됩니다. 칩을 눌러 고르세요.</p>
            </div>
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800" onClick={() => addSentence()}>
              문장 하나 더 추가
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {pack.sentences.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSentenceIndex(i)}
                className={[
                  'rounded-full border px-3 py-1.5 text-left text-xs font-medium transition',
                  i === activeSentenceIndex ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                <span className="font-semibold text-indigo-600">{i + 1}</span>번 · {s.text.slice(0, 20)}
                {s.text.length > 20 ? '…' : ''}
              </button>
            ))}
          </div>
          {pack.sentences.length > 1 ? (
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-rose-600 hover:underline"
              onClick={() => {
                if (window.confirm(`「${sentence.text.slice(0, 24)}${sentence.text.length > 24 ? '…' : ''}」 문장을 지울까요?`)) removeSentence(sentence.id)
              }}
            >
              지금 고른 문장 삭제
            </button>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">① 지금 문장에 쓸 글</h2>
          <p className="mt-1 text-xs text-slate-500">연습할 사람이 그대로 따라 칠 문장입니다. 마침표·띄어쓰기까지 똑같이 맞아야 해요.</p>
          <textarea
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed"
            value={sentence.text}
            onChange={(e) => updateSentenceText(sentence.id, e.target.value)}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">② 겹쳐 올릴 그림들</h2>
              <p className="mt-1 max-w-2xl text-xs text-slate-500">
                배경·삽화처럼 여러 장을 겹칠 수 있어요. <strong>앞·뒤 순서</strong> 숫자가 클수록 앞쪽(위)에 그려집니다. 처음부터 보일 그림은
                「처음부터 보이기」에 체크하세요.
              </p>
            </div>
            <button type="button" className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50" onClick={() => addLayer(sentence.id)}>
              그림 한 장 더
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {sentence.layers.map((layer) => (
              <LayerEditorCard
                key={layer.id}
                sentenceId={sentence.id}
                layer={layer}
                updateLayer={updateLayer}
                removeLayer={removeLayer}
                onPickFile={(file) => onLayerImageFile(sentence.id, layer.id, file)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">③ 타자 칠 때 화면이 바뀌는 순서</h2>
              <p className="mt-1 max-w-2xl text-xs text-slate-600">
                <strong>「몇 글째까지 쳤을 때」</strong>를 기준으로 바뀝니다. 맨 처음(아직 한 글도 안 침)은 <strong>0</strong>, 첫 글자를 맞게 치면{' '}
                <strong>1</strong>… 이런 식이에요. 백스페이스로 지우면 그 글자 수에 맞춰 화면도 다시 계산돼요.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                아래 한 줄이 &quot;그 순간에 할 일&quot; 묶음입니다. <strong>순서 추가</strong>로 줄을 늘리고, 안에서 버튼으로 동작을 쌓으면 됩니다.
              </p>
            </div>
            <button type="button" className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50" onClick={() => addCue(sentence.id, 0)}>
              순서 한 줄 추가
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {[...sentence.cues]
              .map((c, order) => ({ c, order }))
              .sort((a, b) => (a.c.charIndex !== b.c.charIndex ? a.c.charIndex - b.c.charIndex : a.order - b.order))
              .map(({ c: cue }) => (
                <div key={cue.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="text-xs font-medium text-slate-700">
                      몇 글째까지 치면
                      <input
                        type="number"
                        min={0}
                        title="0 = 아직 한 글도 안 쳤을 때, 1 = 첫 글자까지 맞췄을 때 …"
                        className="mt-1 block w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-mono"
                        value={cue.charIndex}
                        onChange={(e) => updateCue(sentence.id, cue.id, { charIndex: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    </label>
                    <CueEffectToolbar
                      layers={sentence.layers}
                      defaultLayerId={defaultLayerId}
                      onAdd={(effect) => appendCueEffect(sentence.id, cue.id, effect)}
                    />
                    <button type="button" className="ml-auto text-xs font-semibold text-rose-600 hover:underline" onClick={() => removeCue(sentence.id, cue.id)}>
                      이 순서 줄 통째로 삭제
                    </button>
                  </div>
                  {cue.effects.length === 0 ? (
                    <p className="mt-2 text-xs text-amber-700">아직 할 일이 없어요. 오른쪽 버튼으로 「보이기」「그림 바꾸기」 등을 넣어 주세요.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-xs text-slate-700">
                      {cue.effects.map((eff, idx) => (
                        <li key={`${cue.id}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                          <span>{summarizeEffect(eff, layerName)}</span>
                          <button type="button" className="shrink-0 text-rose-600 hover:underline" onClick={() => removeCueEffect(sentence.id, cue.id, idx)}>
                            빼기
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">손가락으로 미리 보기</h2>
          <p className="mt-1 text-xs text-slate-500">실제로 타자를 치지 않고, 글자 수만 움직여서 위 화면이 어떻게 나올지 확인해요.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-xs font-medium text-slate-600">
              친 글자 수 시뮬레이션: <span className="font-mono text-indigo-700">{previewLen}</span> / {sentence.text.length}
              <input
                type="range"
                min={0}
                max={Math.max(0, sentence.text.length)}
                value={previewLen}
                className="mt-2 block w-full max-w-md"
                onChange={(e) => setPreviewLen(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="mt-4">
            <VisualStage layers={previewLayers} overlayCaption={getActiveCaption(sentence.captions, previewLen)} />
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  )
}

function LayerEditorCard({
  sentenceId,
  layer,
  updateLayer,
  removeLayer,
  onPickFile,
}: {
  sentenceId: string
  layer: LayerState
  updateLayer: (sid: string, lid: string, p: Partial<LayerState>) => void
  removeLayer: (sid: string, lid: string) => void
  onPickFile: (f: File | null) => void
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">그림 칸</span>
        <button type="button" className="text-xs font-semibold text-rose-600 hover:underline" onClick={() => removeLayer(sentenceId, layer.id)}>
          이 그림 칸 삭제
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-medium text-slate-600">
          부르는 이름 (메모)
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={layer.label} onChange={(e) => updateLayer(sentenceId, layer.id, { label: e.target.value })} />
        </label>
        <label className="text-xs font-medium text-slate-600">
          앞·뒤 순서 (클수록 앞)
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            value={layer.zIndex}
            onChange={(e) => updateLayer(sentenceId, layer.id, { zIndex: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="text-xs font-medium text-slate-600 sm:col-span-2">
          인터넷 그림 주소 (비우면 안 씀)
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            value={layer.imageUrl?.startsWith('data:') ? '' : layer.imageUrl ?? ''}
            placeholder={layer.imageUrl?.startsWith('data:') ? '내 컴퓨터에서 넣은 그림이 붙어 있음' : 'https://...'}
            onChange={(e) => updateLayer(sentenceId, layer.id, { imageUrl: e.target.value || null })}
            disabled={Boolean(layer.imageUrl?.startsWith('data:'))}
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          내 컴퓨터에서 고르기
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.svg,image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            className="mt-1 block w-full text-xs"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {layer.imageUrl?.startsWith('data:') ? (
          <button
            type="button"
            className="self-end text-xs font-semibold text-slate-600 hover:underline sm:col-span-3"
            onClick={() => updateLayer(sentenceId, layer.id, { imageUrl: null })}
          >
            내 컴퓨터 그림 떼기
          </button>
        ) : null}
        <label className="flex items-center gap-2 text-xs text-slate-700 sm:col-span-3">
          <input type="checkbox" checked={layer.visible} onChange={(e) => updateLayer(sentenceId, layer.id, { visible: e.target.checked })} />
          문장이 시작될 때부터 이 그림을 보이게
        </label>
      </div>
      {layer.imageUrl?.startsWith('data:') ? (
        <p className="mt-2 text-[11px] text-slate-500">지금은 내 컴퓨터에서 고른 그림이 붙어 있어요. 주소 칸은 비워 두었습니다. 떼려면 「내 컴퓨터 그림 떼기」를 누르세요.</p>
      ) : (
        <p className="mt-2 text-[11px] text-slate-500">주소와 내 컴퓨터 파일 중 편한 쪽으로 넣으면 됩니다.</p>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        <FieldNum label="왼쪽 위치 %" value={layer.x} onChange={(v) => updateLayer(sentenceId, layer.id, { x: v })} />
        <FieldNum label="위쪽 위치 %" value={layer.y} onChange={(v) => updateLayer(sentenceId, layer.id, { y: v })} />
        <FieldNum label="가로 크기 %" value={layer.width} onChange={(v) => updateLayer(sentenceId, layer.id, { width: v })} />
        <FieldNum label="확대 배율" value={layer.scale} step={0.05} onChange={(v) => updateLayer(sentenceId, layer.id, { scale: v })} />
        <FieldNum label="선명도(1=선명)" value={layer.opacity} max={1} step={0.05} onChange={(v) => updateLayer(sentenceId, layer.id, { opacity: v })} />
      </div>
    </div>
  )
}

function FieldNum({
  label,
  value,
  onChange,
  step = 1,
  max,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  step?: number
  max?: number
}) {
  return (
    <label className="text-xs font-medium text-slate-600">
      {label}
      <input
        type="number"
        step={step}
        max={max}
        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => {
          let n = Number(e.target.value)
          if (max !== undefined) n = Math.min(max, n)
          onChange(n)
        }}
      />
    </label>
  )
}

function CueEffectToolbar({
  layers,
  defaultLayerId,
  onAdd,
}: {
  layers: LayerState[]
  defaultLayerId: string
  onAdd: (e: CueEffect) => void
}) {
  const layerIds = layers.map((l) => l.id)
  const [pick, setPick] = useState(defaultLayerId || layerIds[0] || '')

  const layer = pick || layerIds[0]
  if (layerIds.length === 0) {
    return <span className="text-xs text-amber-700">먼저 위에서 「그림 한 장 더」로 그림 칸을 만드세요.</span>
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <span className="text-xs text-slate-500">적용할 그림:</span>
      <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium" value={pick} onChange={(e) => setPick(e.target.value)}>
        {layers.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label || '이름 없음'} ({l.id.slice(0, 6)}…)
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-1">
        <button type="button" className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => layer && onAdd({ kind: 'layerShow', layerId: layer })}>
          보이기
        </button>
        <button type="button" className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => layer && onAdd({ kind: 'layerHide', layerId: layer })}>
          숨기기
        </button>
        <button
          type="button"
          className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-50"
          onClick={() => {
            if (!layer) return
            const url = window.prompt('붙일 그림의 인터넷 주소를 넣어 주세요.', 'https://')
            if (url) onAdd({ kind: 'layerImage', layerId: layer, imageUrl: url.trim() })
          }}
        >
          그림 바꾸기(URL)
        </button>
        <button
          type="button"
          className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-50"
          onClick={() => {
            if (!layer) return
            const v = window.prompt('선명도: 1이 완전 선명, 0에 가까울수록 흐림 (0~1)', '1')
            if (v === null) return
            const n = Number(v)
            if (!Number.isFinite(n)) return
            onAdd({ kind: 'layerOpacity', layerId: layer, opacity: Math.max(0, Math.min(1, n)) })
          }}
        >
          선명·흐림
        </button>
        <button
          type="button"
          className="rounded-lg bg-white px-2 py-1.5 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-50"
          onClick={() => {
            if (!layer) return
            const x = window.prompt('왼쪽에서 얼마나 띄울지(0~100 숫자, 퍼센트)', '10')
            if (x === null) return
            onAdd({ kind: 'layerTransform', layerId: layer, x: Number(x) })
          }}
        >
          왼쪽 위치만 바꾸기
        </button>
      </div>
    </div>
  )
}
