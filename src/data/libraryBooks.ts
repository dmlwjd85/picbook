import { createSamplePack } from './samplePack'
import { createSeparationThreePowersDemoPack } from './separationThreePowersDemoPack'
import type { ReadingPack } from '../types/pack'

export type LibraryBook = {
  id: string
  title: string
  subtitle: string
  /** 책등 색 */
  spine: string
  /** 표지 그라데이션 tailwind 클래스 조각 */
  cover: string
  loadPack: () => ReadingPack
}

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'sample-wind-cloud',
    title: '바람과 구름',
    subtitle: '짧은 체험 팩',
    spine: 'from-sky-600 to-sky-800',
    cover: 'from-sky-400 via-cyan-300 to-blue-500',
    loadPack: createSamplePack,
  },
  {
    id: 'demo-separation-three-powers',
    title: '삼권분립',
    subtitle: '타자 연동 연출 데모',
    spine: 'from-amber-800 to-amber-950',
    cover: 'from-amber-500 via-orange-400 to-rose-500',
    loadPack: createSeparationThreePowersDemoPack,
  },
]

export function getLibraryBook(id: string): LibraryBook | undefined {
  return LIBRARY_BOOKS.find((b) => b.id === id)
}
