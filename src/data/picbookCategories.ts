/** 픽북 분류 — 서점·홈·편집창이 같은 목록을 쓴다. 새 분류는 여기에만 추가하면 된다. */
export const PICBOOK_CATEGORIES = [
  { id: 'fairy-tale', label: '동화', description: '이야기를 따라 쓰며 읽어요' },
  { id: 'curriculum', label: '교과', description: '1~6학년 교과 내용을 익혀요' },
  { id: 'proverb', label: '속담', description: '속담의 뜻을 그림으로 배워요' },
  { id: 'quote', label: '명언', description: '마음에 남는 한 문장' },
  { id: 'etc', label: '기타', description: '그 밖의 픽북' },
] as const

export type PicbookCategoryId = (typeof PICBOOK_CATEGORIES)[number]['id']

/** 교과 분류에서만 쓰는 학년 */
export const PICBOOK_GRADES = [1, 2, 3, 4, 5, 6] as const
export type PicbookGrade = (typeof PICBOOK_GRADES)[number]

export function categoryLabel(id: PicbookCategoryId | undefined, grade?: number, subject?: string): string {
  const cat = PICBOOK_CATEGORIES.find((c) => c.id === id) ?? PICBOOK_CATEGORIES[PICBOOK_CATEGORIES.length - 1]
  if (cat.id !== 'curriculum') return cat.label
  return [grade ? `${grade}학년` : null, subject?.trim() || '교과'].filter(Boolean).join(' ')
}
