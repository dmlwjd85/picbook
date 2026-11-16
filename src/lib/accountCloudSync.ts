import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { PanelSceneEdit } from '../types/sceneEdit'
import type { SentenceTimeline } from '../types/timeline'
import { getPicbookFirestore, isFirebaseEnabled } from './firebase'

/** 회원 문서 — users/{uid}. 본인만 읽고 쓸 수 있다(firestore.rules). */
export const USERS_COLLECTION = 'users'

export type CloudUserDoc = {
  loginId: string
  nickname: string
  unlockedIds: string[]
  timelines: Record<string, Record<string, SentenceTimeline>>
  sceneEditsByBook: Record<string, Record<string, PanelSceneEdit>>
  createdAt: string
  updatedAt: string
}

/** 연출 스토어에 병합할 때 쓰는 부분 */
export type CloudMasterData = Pick<CloudUserDoc, 'timelines' | 'sceneEditsByBook'>

/** Firebase가 설정되면 기기 간 연동 */
export function isCloudSyncEnabled(): boolean {
  return isFirebaseEnabled()
}

export async function fetchCloudUser(uid: string): Promise<CloudUserDoc | null> {
  const db = await getPicbookFirestore()
  if (!db) return null
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snap.exists()) return null
  const data = snap.data() as Partial<CloudUserDoc>
  return {
    loginId: data.loginId ?? '',
    nickname: data.nickname ?? '',
    unlockedIds: data.unlockedIds ?? [],
    timelines: data.timelines ?? {},
    sceneEditsByBook: data.sceneEditsByBook ?? {},
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? '',
  }
}

/** 가입 직후 1회 — 회원 문서 생성. 실패하면 예외를 던진다. */
export async function createCloudUser(
  uid: string,
  data: Pick<CloudUserDoc, 'loginId' | 'nickname' | 'createdAt'>,
): Promise<void> {
  const db = await getPicbookFirestore()
  if (!db) throw new Error('Firebase가 설정되지 않았습니다')
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    ...data,
    unlockedIds: [],
    timelines: {},
    sceneEditsByBook: {},
    updatedAt: data.createdAt,
  } satisfies CloudUserDoc)
}

/** 서재·연출 변경 저장 */
export async function pushCloudUser(
  uid: string,
  data: Pick<CloudUserDoc, 'unlockedIds' | 'timelines' | 'sceneEditsByBook'>,
): Promise<boolean> {
  const db = await getPicbookFirestore()
  if (!db) return false
  try {
    await setDoc(
      doc(db, USERS_COLLECTION, uid),
      { ...data, updatedAt: new Date().toISOString() },
      { merge: true },
    )
    return true
  } catch (e) {
    console.warn('[PicBook] 회원 정보 저장 실패', e)
    return false
  }
}

/** 관리자 여부 — admins/{uid} 문서가 있으면 관리자. 문서는 Firebase 콘솔에서만 만들 수 있다. */
export async function fetchIsAdmin(uid: string): Promise<boolean> {
  const db = await getPicbookFirestore()
  if (!db) return false
  try {
    return (await getDoc(doc(db, 'admins', uid))).exists()
  } catch {
    return false
  }
}
