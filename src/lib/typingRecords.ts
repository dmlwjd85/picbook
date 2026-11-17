import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { getPicbookAuth, getPicbookFirestore } from './firebase'

/** 문장 하나를 끝까지 쓴 기록 */
export type TypingRecord = {
  bookId: string
  bookTitle: string
  sentence: string
  /** 분당 타수 */
  cpm: number
  /** 정확도 0~100 */
  accuracy: number
  chars: number
  at: string
}

export type RankingEntry = {
  uid: string
  nickname: string
  bestCpm: number
  accuracy: number
  updatedAt: string
}

/** 랭킹에 오르려면: 너무 짧은 문장·낮은 정확도는 제외 (firestore.rules와 같은 기준) */
export const RANKING_MIN_CHARS = 8
export const RANKING_MIN_ACCURACY = 90
export const RANKING_MAX_CPM = 1500

export function isRankable(r: Pick<TypingRecord, 'cpm' | 'accuracy' | 'chars'>): boolean {
  return (
    r.chars >= RANKING_MIN_CHARS &&
    r.accuracy >= RANKING_MIN_ACCURACY &&
    r.cpm > 0 &&
    r.cpm <= RANKING_MAX_CPM
  )
}

/** 기록을 클라우드에 남기고, 책별 최고 기록이면 랭킹을 갱신한다. 실패해도 연습은 계속된다. */
export async function saveRecordToCloud(uid: string, nickname: string, record: TypingRecord): Promise<void> {
  const db = await getPicbookFirestore()
  if (!db || getPicbookAuth()?.currentUser?.uid !== uid) return
  try {
    await addDoc(collection(db, 'users', uid, 'records'), record)
    if (!isRankable(record)) return
    const ref = doc(db, 'rankings', record.bookId, 'entries', uid)
    const prev = await getDoc(ref)
    if (prev.exists() && (prev.data() as RankingEntry).bestCpm >= record.cpm) return
    await setDoc(ref, {
      uid,
      nickname,
      bestCpm: record.cpm,
      accuracy: record.accuracy,
      updatedAt: record.at,
    } satisfies RankingEntry)
  } catch (e) {
    console.warn('[PicBook] 기록 저장 실패', e)
  }
}

/** 책별 랭킹 상위 — 실패하면 null(연결 문제), 기록이 없으면 빈 배열 */
export async function fetchRanking(bookId: string, top = 20): Promise<RankingEntry[] | null> {
  const db = await getPicbookFirestore()
  if (!db) return null
  try {
    const snap = await getDocs(
      query(collection(db, 'rankings', bookId, 'entries'), orderBy('bestCpm', 'desc'), limit(top)),
    )
    return snap.docs.map((d) => d.data() as RankingEntry)
  } catch (e) {
    console.warn('[PicBook] 랭킹 불러오기 실패', e)
    return null
  }
}

/** 내 최근 기록(다른 기기에서 한 것 포함) */
export async function fetchMyRecords(uid: string, top = 50): Promise<TypingRecord[] | null> {
  const db = await getPicbookFirestore()
  if (!db) return null
  try {
    const snap = await getDocs(query(collection(db, 'users', uid, 'records'), orderBy('at', 'desc'), limit(top)))
    return snap.docs.map((d) => d.data() as TypingRecord)
  } catch (e) {
    console.warn('[PicBook] 내 기록 불러오기 실패', e)
    return null
  }
}
