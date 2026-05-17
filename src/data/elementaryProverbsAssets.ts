const base = import.meta.env.BASE_URL
const p = (name: string) => `${base}demo/proverbs/${name}`

/** 초등 필수 속담 — 이미지 경로 (public/demo/proverbs/) */
export const PROVERBS_IMAGES = {
  cover: p('proverbs-cover.png'),
} as const

/**
 * 제미나이·채팅 첨부 이미지 배치 슬롯.
 * 파일을 public/demo/proverbs/ 에 넣고 file 이름을 맞춘 뒤,
 * elementaryProverbsPack.ts 문장·큐에 연결한다.
 */
export const PROVERBS_IMAGE_SLOTS = [
  { id: 'cover', file: 'proverbs-cover.png', label: '표지', ready: true },
  { id: 's01-open', file: 'proverbs-01-open.png', label: '도입 — 속담이란', ready: false },
  { id: 's01-turtle', file: 'proverbs-01-turtle.png', label: '토끼와 거북이', ready: false },
  { id: 's02-magpie', file: 'proverbs-02-magpie.png', label: '까마귀와 까치', ready: false },
  { id: 's02-words', file: 'proverbs-02-words.png', label: '가는 말이 고와야', ready: false },
  { id: 's03-habit', file: 'proverbs-03-habit.png', label: '습관과 실천', ready: false },
  { id: 's03-close', file: 'proverbs-03-close.png', label: '마무리', ready: false },
] as const
