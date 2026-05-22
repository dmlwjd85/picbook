import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createSamplePack } from '../data/samplePack'
import {
  createSeparationThreePowersDemoPack,
  SEPARATION_DEMO_VISUAL_MILESTONES,
} from '../data/separationThreePowersDemoPack'
import { computeLayerSnapshot } from '../lib/cueEngine'
import { usePlaybackTyping } from '../hooks/usePlaybackTyping'
import { getActiveCaption } from '../lib/getActiveCaption'
import { parsePackJson } from '../lib/parsePack'
import type { ReadingPack } from '../types/pack'
import { TypingPanel } from '../components/TypingPanel'
import { VisualStage } from '../components/VisualStage'

export default function PlayerPage() {
  const [pack, setPack] = useState<ReadingPack | null>(null)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [typingDraft, setTypingDraft] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const sentence = pack?.sentences[sentenceIndex]
  const target = sentence?.text ?? ''
  const { visualTypedLen } = usePlaybackTyping(target, typed, typingDraft)

  useEffect(() => {
    setTyped('')
    setTypingDraft('')
  }, [sentenceIndex, sentence?.id])

  const layers = useMemo(() => {
    if (!sentence) return []
    return computeLayerSnapshot(sentence, visualTypedLen)
  }, [sentence, visualTypedLen])

  const onLoadFile = useCallback((file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const parsed = parsePackJson(text)
      if (!parsed.ok) {
        window.alert(parsed.error)
        return
      }
      setPack(parsed.pack)
      setSentenceIndex(0)
    }
    reader.readAsText(file, 'utf-8')
  }, [])

  const loadSample = useCallback(() => {
    setPack(createSamplePack())
    setSentenceIndex(0)
  }, [])

  const loadSeparationDemo = useCallback(() => {
    setPack(createSeparationThreePowersDemoPack())
    setSentenceIndex(0)
  }, [])

  const demoSlideLabel = useMemo(() => {
    if (pack?.id !== 'demo-separation-three-powers' || !sentence) return null
    const milestones = SEPARATION_DEMO_VISUAL_MILESTONES
    let slide = 0
    for (let i = 0; i < milestones.length; i++) {
      if (visualTypedLen >= milestones[i]) slide = i + 1
    }
    return slide
  }, [pack?.id, sentence, visualTypedLen])
  const complete = target.length > 0 && typed === target
  const lastSentence = pack ? sentenceIndex >= pack.sentences.length - 1 : true

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/" className="text-xs font-medium text-indigo-600 hover:underline">
              ← 홈
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">사용자 — 팩 실행</h1>
            <p className="mt-1 text-sm text-slate-600">
              팩 JSON 파일을 열거나 샘플로 체험한 뒤, 위 화면이 타이핑에 맞춰 변하는지 확인하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onLoadFile(e.target.files?.[0] ?? null)} />
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              onClick={() => fileRef.current?.click()}
            >
              팩 파일 열기
            </button>
            <button
              type="button"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              onClick={loadSample}
            >
              샘플 팩
            </button>
            <button
              type="button"
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900 shadow-sm hover:bg-indigo-100"
              onClick={loadSeparationDemo}
              title="삼권분립 데모: 부처 순차 등장, 중간 장면 전환, 독재자·꼭두각시 장면, 견제 장면까지 타이핑에 맞춰 바뀝니다."
            >
              삼권분립 연출 테스트
            </button>
          </div>
        </header>

        {!pack ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            팩을 불러오면 이곳에서 문장 연습이 시작됩니다.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{pack.title}</h2>
                <span className="text-xs text-slate-500">
                  문장 {sentenceIndex + 1} / {pack.sentences.length}
                </span>
              </div>
              {pack.description ? <p className="mt-2 text-sm text-slate-600">{pack.description}</p> : null}
            </div>

            <VisualStage
              layers={layers}
              overlayCaption={getActiveCaption(sentence?.captions, visualTypedLen)}
            />
            {demoSlideLabel !== null ? (
              <p className="text-center text-xs font-medium text-indigo-700">
                지금 보이는 그림: <span className="font-mono">{demoSlideLabel}</span> /{' '}
                {SEPARATION_DEMO_VISUAL_MILESTONES.length} (타이핑 글자 수에 따라 바뀝니다)
              </p>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-medium text-slate-700">이번 문장</p>
              <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 font-mono text-base leading-relaxed text-slate-800">{target}</p>
              <TypingPanel
                target={target}
                typed={typed}
                onTypedChange={setTyped}
                onDraftChange={setTypingDraft}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {complete ? (
                  <button
                    type="button"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                    disabled={lastSentence}
                    onClick={() => {
                      setSentenceIndex((i) => i + 1)
                    }}
                  >
                    {lastSentence ? '마지막 문장입니다' : '다음 문장'}
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">문장을 끝까지 맞게 입력하면 다음으로 갈 수 있습니다.</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
