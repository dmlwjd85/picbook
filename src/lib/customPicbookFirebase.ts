import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import type { CustomPicbookRecord } from '../types/customPicbook'
import { getPicbookFirestore, isFirebaseEnabled } from './firebase'

const COL = 'picbook_custom_books'

export async function publishCustomPicbook(meta: CustomPicbookRecord): Promise<boolean> {
  const db = await getPicbookFirestore()
  if (!db) return false
  try {
    await setDoc(doc(db, COL, meta.id), { ...meta, publishedAt: new Date().toISOString() }, { merge: true })
    return true
  } catch (e) {
    console.warn('[PicBook] 커스텀 픽북 배포 실패', e)
    return false
  }
}

export async function fetchAllCustomPicbooks(): Promise<CustomPicbookRecord[]> {
  if (!isFirebaseEnabled()) return []
  const db = await getPicbookFirestore()
  if (!db) return []
  try {
    const snap = await getDocs(collection(db, COL))
    return snap.docs.map((d) => d.data() as CustomPicbookRecord).filter((m) => m.id && m.title)
  } catch {
    return []
  }
}
