import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
} from 'firebase/firestore'
import { PASS_PRODUCTS, type PassId } from '../data/passProducts'
import { getPicbookFirestore } from './firebase'

/**
 * 이용권 = users/{uid}/passes/{분류 id} 문서.
 * 문서가 있으면 그 분류의 픽북이 보관함에서 열린다.
 * 만드는 길은 두 가지뿐이다(firestore.rules):
 *  1) 이용권 코드 등록 — 코드 사용 횟수 차감과 한 묶음으로만 생성 가능
 *  2) 결제 서버(Admin SDK) 또는 관리자 — 결제가 확인되면 서버가 직접 쓴다
 */
const KEYS_COL = 'pass_keys'

export type PassKeyDoc = {
  category: PassId
  maxUses: number
  uses: number
  memo: string
  createdAt: string
}

export function normalizePassKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function fetchPasses(uid: string): Promise<string[]> {
  const db = await getPicbookFirestore()
  if (!db) return []
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'passes'))
    return snap.docs.map((d) => d.id)
  } catch (e) {
    console.warn('[PicBook] 이용권 불러오기 실패', e)
    return []
  }
}

export type RedeemResult = { ok: true; pass: PassId } | { ok: false; error: string }

/** 이용권 코드 등록 — 코드 1회 차감 + 내 이용권 생성을 한 번에 처리한다 */
export async function redeemPassKey(uid: string, rawKey: string): Promise<RedeemResult> {
  const key = normalizePassKey(rawKey)
  if (key.length < 8) return { ok: false, error: '이용권 코드를 정확히 입력해 주세요.' }
  const db = await getPicbookFirestore()
  if (!db) return { ok: false, error: '체험 모드에서는 이용권을 등록할 수 없어요.' }
  try {
    return await runTransaction(db, async (tx): Promise<RedeemResult> => {
      const keyRef = doc(db, KEYS_COL, key)
      const keySnap = await tx.get(keyRef)
      if (!keySnap.exists()) return { ok: false, error: '없는 코드예요. 다시 확인해 주세요.' }
      const data = keySnap.data() as PassKeyDoc
      if (data.uses >= data.maxUses) return { ok: false, error: '이미 모두 사용된 코드예요.' }
      const passRef = doc(db, 'users', uid, 'passes', data.category)
      if ((await tx.get(passRef)).exists()) return { ok: false, error: '이미 가지고 있는 이용권이에요.' }
      tx.update(keyRef, { uses: data.uses + 1 })
      tx.set(passRef, {
        category: data.category,
        source: 'key',
        key,
        grantedAt: new Date().toISOString(),
      })
      return { ok: true, pass: data.category }
    })
  } catch (e) {
    console.warn('[PicBook] 이용권 등록 실패', e)
    return { ok: false, error: '등록하지 못했어요. 코드를 다시 확인하거나 잠시 후 시도해 주세요.' }
  }
}

/** 헷갈리는 글자(0·O·1·I)를 뺀 무작위 코드 — 추측으로 맞힐 수 없게 충분히 길게 */
function randomKey(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length])
  return `PB-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}-${chars.slice(12).join('')}`
}

/** (관리자) 이용권 코드 발급. 돌려주는 값이 사용자에게 전달할 코드 */
export async function createPassKey(category: PassId, maxUses: number, memo: string): Promise<string | null> {
  const db = await getPicbookFirestore()
  if (!db || !PASS_PRODUCTS.some((p) => p.id === category)) return null
  const display = randomKey()
  try {
    await setDoc(doc(db, KEYS_COL, normalizePassKey(display)), {
      category,
      maxUses: Math.max(1, Math.floor(maxUses)),
      uses: 0,
      memo: memo.trim(),
      createdAt: new Date().toISOString(),
    } satisfies PassKeyDoc)
    return display
  } catch (e) {
    console.warn('[PicBook] 이용권 코드 발급 실패', e)
    return null
  }
}

/** (관리자) 발급한 코드 목록 */
export async function listPassKeys(): Promise<(PassKeyDoc & { key: string })[]> {
  const db = await getPicbookFirestore()
  if (!db) return []
  try {
    const snap = await getDocs(query(collection(db, KEYS_COL), orderBy('createdAt', 'desc')))
    return snap.docs.map((d) => ({ ...(d.data() as PassKeyDoc), key: d.id }))
  } catch (e) {
    console.warn('[PicBook] 이용권 코드 목록 실패', e)
    return []
  }
}
