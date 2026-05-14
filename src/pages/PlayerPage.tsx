import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createSamplePack } from '../data/samplePack'
import { computeLayerSnapshot } from '../lib/cueEngine'
import { parsePackJson } from '../lib/parsePack'
import type { ReadingPack } from '../types/pack'
import { TypingPanel } from '../components/TypingPanel'
import { VisualStage } from '../components/VisualStage'

export default function PlayerPage() {
  const [pack, setPack] = useState<ReadingPack | null>(null)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const sentence = pack?.sentences[sentenceIndex]

  useEffect(() => {
    setTyped('')
  }, [sentenceIndex, sentence?.id])

  const layers = useMemo(() => {
    if (!sentence) return []
    return computeLayerSnapshot(sentence, typed.length)
  }, [sentence, typed])

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

  const target = sentence?.text ?? ''
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

            <VisualStage layers={layers} />

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-medium text-slate-700">이번 문장</p>
              <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 font-mono text-base leading-relaxed text-slate-800">{target}</p>
              <TypingPanel target={target} typed={typed} onTypedChange={setTyped} />
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
