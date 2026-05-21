import { useMemo, useRef, useState } from 'react'
import { resolveVisualImageUrl } from '../lib/visualDictionaryPaths'
import { findVisualMatchesInText } from '../lib/matchVisualChunks'
import { ChunkDictionaryStagingPreview } from './ChunkDictionaryStagingPreview'
import {
  filterVisualEntries,
  useVisualDictionaryStore,
} from '../state/visualDictionaryStore'
import type { VisualDictionaryEntry, VisualDictionaryInsertMode } from '../types/visualDictionary'
import type { VisualPartOfSpeech } from '../types/visualDictionary'

const POS_OPTIONS: { id: VisualPartOfSpeech | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'background', label: '배경' },
  { id: 'noun', label: '명사' },
  { id: 'verb', label: '동사' },
  { id: 'adjective', label: '형용사' },
  { id: 'emotion', label: '감정' },
  { id: 'effect', label: '이펙트' },
]

type Props = {
  /** 현재 편집 중인 문장 텍스트 — 청크 매칭 미리보기 */
  sentenceText?: string
  /** 타자 시뮬 글자 수까지 — 재생 연출 미리보기 */
  typedPrefix?: string
  onInsert: (entry: VisualDictionaryEntry, mode: VisualDictionaryInsertMode) => void
}

export function VisualDictionaryEditorPanel({
  sentenceText = '',
  typedPrefix = '',
  onInsert,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const entries = useVisualDictionaryStore((s) => s.entries)
  const search = useVisualDictionaryStore((s) => s.search)
  const posFilter = useVisualDictionaryStore((s) => s.posFilter)
  const setSearch = useVisualDictionaryStore((s) => s.setSearch)
  const setPosFilter = useVisualDictionaryStore((s) => s.setPosFilter)
  const importCsvText = useVisualDictionaryStore((s) => s.importCsvText)
  const resetToTortoiseHareSeed = useVisualDictionaryStore((s) => s.resetToTortoiseHareSeed)
  const loadFromCloud = useVisualDictionaryStore((s) => s.loadFromCloud)
  const publishToCloud = useVisualDictionaryStore((s) => s.publishToCloud)
  const assignEntryImageUrl = useVisualDictionaryStore((s) => s.assignEntryImageUrl)
  const [imageSearchUrl, setImageSearchUrl] = useState('')

  const filtered = useMemo(
    () => filterVisualEntries(entries, search, posFilter),
    [entries, search, posFilter],
  )

  const chunkPreview = useMemo(() => {
    if (!sentenceText.trim()) return []
    return findVisualMatchesInText(sentenceText, entries).slice(0, 12)
  }, [sentenceText, entries])

  const onCsvFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const res = importCsvText(text)
      if (!res.ok) window.alert(res.error)
      else window.alert(`${res.count}개 항목을 반영했습니다.`)
    }
    reader.readAsText(file, 'UTF-8')
  }

  return (
    <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-violet-900">수어·의미 시각 사전</h2>
          <p className="mt-1 text-xs text-slate-600">
            글자가 아닌 <strong>의미 청크</strong>에 PNG를 매핑합니다. 예시: 토끼와 거북이 ({entries.length}어)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-violet-200 bg-white px-2 py-1 text-[11px] font-bold text-violet-800 hover:bg-violet-50"
            onClick={() => resetToTortoiseHareSeed()}
          >
            예시 시드
          </button>
          <button
            type="button"
            className="rounded-lg border border-violet-200 bg-white px-2 py-1 text-[11px] font-bold text-violet-800 hover:bg-violet-50"
            onClick={() => void loadFromCloud()}
          >
            Firebase 불러오기
          </button>
          <button
            type="button"
            className="rounded-lg bg-violet-700 px-2 py-1 text-[11px] font-bold text-white hover:bg-violet-800"
            onClick={() => void publishToCloud().then((ok) => window.alert(ok ? '사전 Firebase 저장 완료' : '저장 실패'))}
          >
            사전 배포
          </button>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        협업 CSV: <code className="rounded bg-slate-100 px-1">data/visual-dictionary/template/visual_dictionary_template.csv</code>
        · PNG: <code className="rounded bg-slate-100 px-1">public/visual-dictionary/</code>
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="단어·태그·파일명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[12rem] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <label className="cursor-pointer rounded-lg border border-dashed border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-50">
          CSV 가져오기
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              onCsvFile(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
        </label>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {POS_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPosFilter(o.id)}
            className={
              posFilter === o.id
                ? 'rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold text-white'
                : 'rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50'
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-violet-100 bg-white/80 p-2">
        <p className="text-[10px] font-semibold text-violet-800">연출 미리보기 (검색·불러온 그림 반영)</p>
        <div className="mt-2 max-w-sm">
          <ChunkDictionaryStagingPreview
            typedPrefix={typedPrefix || sentenceText}
            entries={entries}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="url"
          placeholder="검색한 그림 URL 붙여넣기 → 아래 카드에서 「URL 연결」"
          value={imageSearchUrl}
          onChange={(e) => setImageSearchUrl(e.target.value)}
          className="min-w-[14rem] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {chunkPreview.length > 0 ? (
        <div className="mt-3 rounded-lg border border-violet-100 bg-white/80 p-2">
          <p className="text-[10px] font-semibold text-violet-800">문장 청크 매칭 ({chunkPreview.length})</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {chunkPreview.map((m) => (
              <button
                key={`${m.entry.word_id}-${m.start}`}
                type="button"
                className="rounded bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-900 hover:bg-violet-200"
                onClick={() => onInsert(m.entry, m.entry.part_of_speech === 'background' ? 'background' : 'overlay')}
              >
                {m.matchedText} → {m.entry.word}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ul className="mt-3 grid max-h-[420px] gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <DictionaryCard
            key={entry.word_id}
            entry={entry}
            onInsert={onInsert}
            pendingImageUrl={imageSearchUrl.trim()}
            onAssignUrl={(url) => assignEntryImageUrl(entry.word_id, url)}
          />
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">검색 결과가 없습니다.</p>
      ) : null}
    </section>
  )
}

function DictionaryCard({
  entry,
  onInsert,
  pendingImageUrl,
  onAssignUrl,
}: {
  entry: VisualDictionaryEntry
  onInsert: (entry: VisualDictionaryEntry, mode: VisualDictionaryInsertMode) => void
  pendingImageUrl: string
  onAssignUrl: (url: string) => void
}) {
  const url = resolveVisualImageUrl(entry)
  return (
    <li className="flex gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <img
        src={url}
        alt=""
        className="h-16 w-16 shrink-0 rounded-lg border border-slate-100 bg-stone-900 object-contain"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.opacity = '0.35'
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{entry.word}</p>
        <p className="text-[10px] text-slate-500">
          {entry.part_of_speech} · z{entry.z_index} · {entry.file_name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-600">{entry.image_direction}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          <button
            type="button"
            className="rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold text-white"
            onClick={() => onInsert(entry, 'background')}
          >
            배경
          </button>
          <button
            type="button"
            className="rounded bg-sky-600 px-1.5 py-0.5 text-[9px] font-bold text-white"
            onClick={() => onInsert(entry, 'frame')}
          >
            프레임
          </button>
          <button
            type="button"
            className="rounded bg-fuchsia-600 px-1.5 py-0.5 text-[9px] font-bold text-white"
            onClick={() => onInsert(entry, 'overlay')}
          >
            오버레이
          </button>
          {pendingImageUrl ? (
            <button
              type="button"
              className="rounded bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white"
              onClick={() => {
                onAssignUrl(pendingImageUrl)
                onInsert({ ...entry, image_url: pendingImageUrl }, 'frame')
              }}
            >
              URL 연결
            </button>
          ) : null}
        </div>
      </div>
    </li>
  )
}
