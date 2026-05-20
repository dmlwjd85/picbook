import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { SentenceTimeline } from '../types/timeline'
import { getPicbookFirestore, isFirebaseEnabled } from './firebase'

/** 마스터 배포 — 전체 사용자 재생에 반영 */
const COL = 'picbook_published_timelines'

export async function publishBookTimelines(
  bookId: string,
  timelines: Record<string, SentenceTimeline>,
): Promise<boolean> {
  const db = await getPicbookFirestore()
  if (!db) return false
  try {
    await setDoc(
      doc(db, COL, bookId),
      {
        bookId,
        timelines,
        publishedAt: new Date().toISOString(),
      },
      { merge: true },
    )
    return true
  } catch (e) {
    console.warn('[PicBook] 타임라인 배포 실패', e)
    return false
  }
}

export async function fetchPublishedBookTimelines(
  bookId: string,
): Promise<Record<string, SentenceTimeline> | null> {
  if (!isFirebaseEnabled()) return null
  const db = await getPicbookFirestore()
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, COL, bookId))
    if (!snap.exists()) return null
    const data = snap.data() as { timelines?: Record<string, SentenceTimeline> }
    return data.timelines ?? null
  } catch {
    return null
  }
}
