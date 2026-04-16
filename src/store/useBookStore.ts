import { create } from 'zustand'

export type SentenceStatus = 'idle' | 'loading' | 'done'

export type DirectingStatus = 'draft' | 'done'

export type Directing = {
  status: DirectingStatus
  // 화면에서 이미지를 “연출”하기 위한 간단한 파라미터(추후 ComfyUI/레이어 편집으로 확장)
  scale: number // 0.8 ~ 1.6
  translateX: number // -120 ~ 120 (px)
  translateY: number // -120 ~ 120 (px)
  rotateDeg: number // -8 ~ 8
  brightness: number // 0.75 ~ 1.25
  contrast: number // 0.85 ~ 1.25
  notes: string // 디렉터 메모(프롬프트/연출 의도)
}

export type Sentence = {
  id: string
  text: string
  imageUrl: string | null
  status: SentenceStatus
  isComplete: boolean
  directing: Directing
}

export type PicBookPage = {
  sentenceId: string
  text: string
  imageUrl: string
  directing: Directing
}

export type PicBook = {
  id: string
  title: string
  createdAt: string
  pages: PicBookPage[]
  price: number // MVP: 모의 코인 가격
  purchased: boolean
}

type BookState = {
  fullText: string
  sentences: Sentence[]
  picBooks: PicBook[]
  wallet: { coins: number }
  setFullText: (nextText: string) => void
  updateDirecting: (sentenceId: string, patch: Partial<Directing>) => void
  markDirectingDone: (sentenceId: string) => void
  resetDirecting: (sentenceId: string) => void
  canAssemblePicBookFromDraft: () => { ok: true } | { ok: false; reason: string }
  assemblePicBookFromDraft: () => { ok: true; picBook: PicBook } | { ok: false; reason: string }
  purchasePicBook: (picBookId: string) => { ok: true } | { ok: false; reason: string }
  grantMockCoins: (amount: number) => void
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

function defaultDirecting(): Directing {
  return {
    status: 'draft',
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotateDeg: 0,
    brightness: 1,
    contrast: 1,
    notes: '',
  }
}

function mergeDirecting(prev: Directing, patch: Partial<Directing>): Directing {
  const nextStatus: DirectingStatus = patch.status ?? prev.status
  return {
    status: nextStatus,
    scale: patch.scale ?? prev.scale,
    translateX: patch.translateX ?? prev.translateX,
    translateY: patch.translateY ?? prev.translateY,
    rotateDeg: patch.rotateDeg ?? prev.rotateDeg,
    brightness: patch.brightness ?? prev.brightness,
    contrast: patch.contrast ?? prev.contrast,
    notes: patch.notes ?? prev.notes,
  }
}

function hash32FNV1a(input: string): number {
  // 빠르고 간단한 문자열 해시(결정적). Mock 이미지의 seed로 사용.
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function svgDataUrl(sentenceText: string): string {
  const safe = sentenceText.length > 52 ? `${sentenceText.slice(0, 52)}…` : sentenceText
  const seed = hash32FNV1a(sentenceText)
  const rnd = mulberry32(seed)

  const palettes = [
    ['#fdf2f8', '#eef2ff', '#ecfeff', '#111827'],
    ['#fff7ed', '#fef3c7', '#ecfccb', '#1f2937'],
    ['#f0fdf4', '#e0f2fe', '#ede9fe', '#0f172a'],
    ['#eff6ff', '#fae8ff', '#fef9c3', '#111827'],
    ['#f5f3ff', '#e0e7ff', '#cffafe', '#0b1220'],
  ]
  const palette = palettes[seed % palettes.length]

  const bgA = palette[0]
  const bgB = palette[1]
  const bgC = palette[2]
  const ink = palette[3]

  const sunX = Math.floor(160 + rnd() * 960)
  const sunY = Math.floor(110 + rnd() * 220)
  const sunR = Math.floor(42 + rnd() * 64)

  const hillH = Math.floor(120 + rnd() * 160)
  const hillWave = Math.floor(80 + rnd() * 140)
  const hillY = 580 + Math.floor(rnd() * 60)

  const doodles = Array.from({ length: 9 }, () => ({
    x: Math.floor(80 + rnd() * 1120),
    y: Math.floor(80 + rnd() * 520),
    r: Math.floor(10 + rnd() * 28),
    o: clamp(0.05 + rnd() * 0.12, 0.05, 0.18),
  }))

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="832" viewBox="0 0 1280 832">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgA}"/>
      <stop offset="52%" stop-color="${bgB}"/>
      <stop offset="100%" stop-color="${bgC}"/>
    </linearGradient>
    <filter id="paper" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0.18" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.10" />
      </feComponentTransfer>
    </filter>
    <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
  </defs>

  <rect width="1280" height="832" fill="url(#g)"/>
  <rect width="1280" height="832" filter="url(#paper)" opacity="0.95"/>

  <!-- 하늘의 점/도형(문장 seed 기반으로 매번 다름) -->
  <g fill="${ink}">
    ${doodles
      .map((d) => `<circle cx="${d.x}" cy="${d.y}" r="${d.r}" opacity="${d.o}"/>`)
      .join('\n    ')}
  </g>

  <!-- 태양 -->
  <g opacity="0.92">
    <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${ink}" opacity="0.08"/>
    <circle cx="${sunX}" cy="${sunY}" r="${Math.max(18, sunR - 18)}" fill="${ink}" opacity="0.06"/>
  </g>

  <!-- 언덕(간단한 풍경) -->
  <path
    d="M0 ${hillY} C 220 ${hillY - hillH}, 520 ${hillY + hillWave}, 800 ${hillY - hillH + 28} S 1100 ${hillY + hillWave}, 1280 ${hillY - 40} L 1280 832 L 0 832 Z"
    fill="${ink}" opacity="0.06"
  />
  <path
    d="M0 ${hillY + 36} C 260 ${hillY - hillH + 60}, 540 ${hillY + hillWave + 30}, 820 ${hillY - hillH + 68} S 1110 ${hillY + hillWave + 20}, 1280 ${hillY + 10} L 1280 832 L 0 832 Z"
    fill="${ink}" opacity="0.045"
  />

  <!-- 스케치 라인 -->
  <g fill="none" stroke="${ink}" stroke-linecap="round">
    <path d="M120 300 C 320 180, 560 190, 770 305 S 1170 420, 1135 560" stroke-opacity="0.10" stroke-width="10"/>
    <path d="M120 332 C 320 210, 560 220, 770 335 S 1170 455, 1135 592" stroke-opacity="0.08" stroke-width="6"/>
  </g>

  <!-- 캡션 -->
  <g font-family="ui-serif, Georgia, 'Times New Roman', serif" fill="${ink}">
    <text x="72" y="740" font-size="34" opacity="0.62">Picturing Book (Mock • seed ${seed})</text>
    <text x="72" y="790" font-size="44" opacity="0.92">${escapeXml(safe)}</text>
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

const STORAGE_KEY = 'picbook.v1'

type PersistedV1 = {
  version: 1
  fullText: string
  sentences: Sentence[]
  picBooks: PicBook[]
  wallet: { coins: number }
}

function safeParse(json: string | null): PersistedV1 | null {
  if (!json) return null
  try {
    const v = JSON.parse(json) as PersistedV1
    if (!v || v.version !== 1) return null
    return v
  } catch {
    return null
  }
}

function loadPersisted(): Partial<PersistedV1> | null {
  if (typeof window === 'undefined') return null
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

function persistSnapshot(state: Pick<BookState, 'fullText' | 'sentences' | 'picBooks' | 'wallet'>) {
  if (typeof window === 'undefined') return
  const payload: PersistedV1 = {
    version: 1,
    fullText: state.fullText,
    sentences: state.sentences,
    picBooks: state.picBooks,
    wallet: state.wallet,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const useBookStore = create<BookState>((set, get) => {
  const hydrated = loadPersisted()

  return {
    fullText: hydrated?.fullText ?? '',
    sentences: (hydrated?.sentences ?? []).map((s) => ({
      ...s,
      directing: s.directing ?? defaultDirecting(),
    })),
    picBooks: hydrated?.picBooks ?? [],
    wallet: hydrated?.wallet ?? { coins: 1200 },

    grantMockCoins: (amount) => {
      set((state) => {
        const next = { ...state.wallet, coins: state.wallet.coins + amount }
        const out = { ...state, wallet: next }
        persistSnapshot(out)
        return out
      })
    },

    updateDirecting: (sentenceId, patch) => {
      set((state) => {
        const nextSentences = state.sentences.map((s) =>
          s.id === sentenceId ? { ...s, directing: mergeDirecting(s.directing, patch) } : s,
        )
        const out = { ...state, sentences: nextSentences }
        persistSnapshot(out)
        return out
      })
    },

    markDirectingDone: (sentenceId) => {
      set((state) => {
        const nextSentences = state.sentences.map((s) =>
          s.id === sentenceId ? { ...s, directing: mergeDirecting(s.directing, { status: 'done' }) } : s,
        )
        const out = { ...state, sentences: nextSentences }
        persistSnapshot(out)
        return out
      })
    },

    resetDirecting: (sentenceId) => {
      set((state) => {
        const nextSentences = state.sentences.map((s) =>
          s.id === sentenceId ? { ...s, directing: defaultDirecting() } : s,
        )
        const out = { ...state, sentences: nextSentences }
        persistSnapshot(out)
        return out
      })
    },

    canAssemblePicBookFromDraft: () => {
      const { sentences } = get()
      if (sentences.length === 0) return { ok: false, reason: '문장이 없습니다.' }

      const notImageReady = sentences.filter((s) => !(s.status === 'done' && s.imageUrl))
      if (notImageReady.length > 0) {
        return { ok: false, reason: '모든 문장의 이미지가 완료되어야 픽북으로 묶을 수 있습니다.' }
      }

      const notDirected = sentences.filter((s) => s.directing.status !== 'done')
      if (notDirected.length > 0) {
        return { ok: false, reason: '모든 문장의 디렉팅이 완료되어야 픽북으로 묶을 수 있습니다.' }
      }

      return { ok: true }
    },

    assemblePicBookFromDraft: () => {
      const gate = get().canAssemblePicBookFromDraft()
      if (!gate.ok) return gate

      const { sentences } = get()
      const title = `내 픽북 ${new Date().toLocaleString()}`
      const picBook: PicBook = {
        id: createId(),
        title,
        createdAt: new Date().toISOString(),
        pages: sentences.map((s) => ({
          sentenceId: s.id,
          text: s.text,
          imageUrl: s.imageUrl ?? '',
          directing: s.directing,
        })),
        price: 490,
        purchased: false,
      }

      set((state) => {
        const out = { ...state, picBooks: [picBook, ...state.picBooks] }
        persistSnapshot(out)
        return out
      })

      return { ok: true, picBook }
    },

    purchasePicBook: (picBookId) => {
      const { picBooks, wallet } = get()
      const book = picBooks.find((b) => b.id === picBookId)
      if (!book) return { ok: false, reason: '픽북을 찾을 수 없습니다.' }
      if (book.purchased) return { ok: false, reason: '이미 구매한 픽북입니다.' }
      if (wallet.coins < book.price) return { ok: false, reason: '코인이 부족합니다. (MVP: 상단의 “코인 충전”을 사용하세요)' }

      set((state) => {
        const nextBooks = state.picBooks.map((b) =>
          b.id === picBookId ? { ...b, purchased: true } : b,
        )
        const nextWallet = { coins: state.wallet.coins - book.price }
        const out = { ...state, picBooks: nextBooks, wallet: nextWallet }
        persistSnapshot(out)
        return out
      })

      return { ok: true }
    },

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
          directing: defaultDirecting(),
        }
      })

      set((state) => {
        const out = { ...state, sentences: next }
        persistSnapshot(out)
        return out
      })

      // 이미지 생성은 렌더링/입력 흐름을 막지 않도록 비동기로 처리
      queueMicrotask(() => {
        const { sentences } = get()
        for (const s of sentences) {
          if (s.status === 'loading' && s.isComplete) {
            // 이미 실행 중이면 중복 호출을 피하기 위해 status만으로 가드한다.
            void (async () => {
              const url = await generateImageMock(s.text)
              set((state) => {
                const nextSentences = state.sentences.map((it) =>
                  it.id === s.id ? { ...it, imageUrl: url, status: 'done' as const } : it,
                )
                const out = { ...state, sentences: nextSentences }
                persistSnapshot(out)
                return out
              })
            })()
          }
        }
      })
    },
  }
})

