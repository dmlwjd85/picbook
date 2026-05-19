import { doc, getDoc, setDoc, type DocumentReference } from 'firebase/firestore'
import { accountKeyFromName, type UserAccount } from '../state/userAccountStore'
import type { PanelSceneEdit } from '../types/sceneEdit'
import type { SentenceTimeline } from '../types/timeline'
import type { CloudAccountPayload } from './accountCloudSync'
import { getPicbookFirestore, isFirebaseEnabled } from './firebase'
import { hashPassword, verifyPassword } from './passwordHash'

/** PicBook 회원·구매·연출 전용 컬렉션 (삼봉월드 Firebase와 분리된 컬렉션) */
export const PICBOOK_ACCOUNTS_COLLECTION = 'picbook_accounts'

export type PicbookAccountDoc = {
  name: string
  passwordHash: string
  unlockedIds: string[]
  timelines: Record<string, Record<string, SentenceTimeline>>
  sceneEditsByBook: Record<string, Record<string, PanelSceneEdit>>
  createdAt: string
  updatedAt: string
}

async function accountRef(accountKey: string): Promise<DocumentReference | null> {
  const db = await getPicbookFirestore()
  if (!db) return null
  return doc(db, PICBOOK_ACCOUNTS_COLLECTION, accountKey)
}

export async function firebaseAccountExists(accountKey: string): Promise<boolean> {
  if (!isFirebaseEnabled()) return false
  const ref = await accountRef(accountKey)
  if (!ref) return false
  try {
    const snap = await getDoc(ref)
    return snap.exists()
  } catch (e) {
    console.warn('[PicBook] Firebase 계정 조회 실패', e)
    return false
  }
}

export async function fetchFirebaseAccount(
  name: string,
  password: string,
): Promise<CloudAccountPayload | null> {
  if (!isFirebaseEnabled()) return null
  const key = accountKeyFromName(name)
  const ref = await accountRef(key)
  if (!ref) return null

  try {
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const data = snap.data() as PicbookAccountDoc
    if (!(await verifyPassword(password, data.passwordHash))) return null

    return {
      name: data.name,
      password,
      unlockedIds: data.unlockedIds ?? [],
      timelines: data.timelines ?? {},
      sceneEditsByBook: data.sceneEditsByBook ?? {},
      updatedAt: data.updatedAt,
    }
  } catch (e) {
    console.warn('[PicBook] Firebase 로그인 데이터 불러오기 실패', e)
    return null
  }
}

export async function pushFirebaseAccount(
  account: UserAccount,
  timelines: Record<string, Record<string, SentenceTimeline>>,
  sceneEditsByBook: Record<string, Record<string, PanelSceneEdit>>,
): Promise<boolean> {
  if (!isFirebaseEnabled()) return false
  const key = accountKeyFromName(account.name)
  const ref = await accountRef(key)
  if (!ref) return false

  try {
    const existing = await getDoc(ref)
    const createdAt =
      existing.exists() ? ((existing.data() as PicbookAccountDoc).createdAt ?? account.createdAt) : account.createdAt

    const payload: PicbookAccountDoc = {
      name: account.name.trim(),
      passwordHash: await hashPassword(account.password),
      unlockedIds: account.unlockedIds,
      timelines,
      sceneEditsByBook,
      createdAt,
      updatedAt: new Date().toISOString(),
    }

    await setDoc(ref, payload, { merge: true })
    return true
  } catch (e) {
    console.warn('[PicBook] Firebase 계정 저장 실패', e)
    return false
  }
}
