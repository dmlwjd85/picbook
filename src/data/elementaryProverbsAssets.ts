const base = import.meta.env.BASE_URL
const p = (name: string) => `${base}demo/proverbs/${name}`

/** 초등 필수 속담 — 이미지 경로 (public/demo/proverbs/) */
export const PROVERBS_IMAGES = {
  cover: p('proverbs-cover.png'),
  kindWords01: p('proverbs-kind-words-01.png'),
  kindWords02: p('proverbs-kind-words-02.png'),
  kindWords03: p('proverbs-kind-words-03.png'),
  kindWords04: p('proverbs-kind-words-04.png'),
  kindWords05: p('proverbs-kind-words-05.png'),
  kindWords06: p('proverbs-kind-words-06.png'),
} as const
