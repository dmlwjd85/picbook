import { create } from 'zustand'

export type SentenceStatus = 'idle' | 'loading' | 'done'

export type Sentence = {
  id: string
  text: string
  imageUrl: string | null
  status: SentenceStatus
  isComplete: boolean
}

type BookState = {
  fullText: string
  sentences: Sentence[]
  setFullText: (nextText: string) => void
}

function createId(): string {
  // 브라우저 런타임에서 사용 가능(React 18 + Vite)
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeSentenceText(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}

function splitIntoSentences(text: string): Array<{ text: string; isComplete: boolean }> {
  // 요구사항 기준: ., ?, !, \n 을 문장 경계로 사용
  // - 구두점/줄바꿈을 포함한 덩어리로 먼저 매칭해서 "완성 여부"를 판단한다.
  const chunks = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) ?? []

  const parsed = chunks
    .map((chunk) => {
      const endsWithDelimiter = /[.!?\n]$/.test(chunk)
      const normalized = normalizeSentenceText(chunk)
      return {
        text: normalized,
        isComplete: endsWithDelimiter && normalized.length > 0,
      }
    })
    .filter((x) => x.text.length > 0)

  return parsed
}

function svgDataUrl(sentenceText: string): string {
  const safe = sentenceText.length > 52 ? `${sentenceText.slice(0, 52)}…` : sentenceText
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="832" viewBox="0 0 1280 832">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5f3ff"/>
      <stop offset="55%" stop-color="#eef2ff"/>
      <stop offset="100%" stop-color="#ecfeff"/>
    </linearGradient>
    <filter id="paper" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0.15" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.08" />
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="1280" height="832" fill="url(#g)"/>
  <rect width="1280" height="832" filter="url(#paper)" opacity="0.9"/>
  <g opacity="0.9">
    <path d="M140 290 C 340 170, 560 170, 760 290 S 1180 410, 1140 560"
      fill="none" stroke="#111827" stroke-opacity="0.10" stroke-width="10" stroke-linecap="round"/>
    <path d="M140 320 C 340 200, 560 200, 760 320 S 1180 440, 1140 590"
      fill="none" stroke="#111827" stroke-opacity="0.08" stroke-width="6" stroke-linecap="round"/>
  </g>
  <g font-family="ui-serif, Georgia, 'Times New Roman', serif" fill="#111827">
    <text x="72" y="740" font-size="36" opacity="0.65">Picturing Book (Mock)</text>
    <text x="72" y="788" font-size="44" opacity="0.92">${escapeXml(safe)}</text>
  </g>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

async function generateImageMock(sentenceText: string): Promise<string> {
  const delay = 650 + Math.floor(Math.random() * 850)
  await new Promise((r) => setTimeout(r, delay))
  return svgDataUrl(sentenceText)
}

export const useBookStore = create<BookState>((set, get) => ({
  fullText: '',
  sentences: [],
  setFullText: (nextText) => {
    set({ fullText: nextText })

    const prev = get().sentences
    const parsed = splitIntoSentences(nextText)

    const next: Sentence[] = parsed.map((p, idx) => {
      const prevAt = prev[idx]
      const canReuse = prevAt && prevAt.text === p.text

      if (canReuse) {
        // 같은 위치/같은 문장 텍스트는 상태를 유지한다.
        const wasComplete = prevAt.isComplete
        const becameComplete = !wasComplete && p.isComplete

        // "미완성 → 완성"으로 바뀌는 순간에만 이미지 생성 트리거
        if (becameComplete && prevAt.status === 'idle') {
          return {
            ...prevAt,
            isComplete: true,
            status: 'loading',
          }
        }

        return { ...prevAt, isComplete: p.isComplete }
      }

      const id = createId()
      return {
        id,
        text: p.text,
        imageUrl: null,
        status: p.isComplete ? 'loading' : 'idle',
        isComplete: p.isComplete,
      }
    })

    set({ sentences: next })

    // 이미지 생성은 렌더링/입력 흐름을 막지 않도록 비동기로 처리
    queueMicrotask(() => {
      const { sentences } = get()
      for (const s of sentences) {
        if (s.status === 'loading' && s.isComplete) {
          // 이미 실행 중이면 중복 호출을 피하기 위해 status만으로 가드한다.
          void (async () => {
            const url = await generateImageMock(s.text)
            set((state) => ({
              sentences: state.sentences.map((it) =>
                it.id === s.id ? { ...it, imageUrl: url, status: 'done' } : it,
              ),
            }))
          })()
        }
      }
    })
  },
}))

