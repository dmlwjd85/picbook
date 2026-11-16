import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore'
import { isBookEditEmpty, type BookEdit } from './bookEdits'
import { getPicbookFirestore, isFirebaseEnabled } from './firebase'

/** 기본 제공 픽북 수정본 — 누구나 읽고, 관리자만 쓴다(firestore.rules) */
const COL = 'picbook_book_edits'

export async function fetchAllBookEdits(): Promise<Record<string, BookEdit>> {
  if (!isFirebaseEnabled()) return {}
  const db = await getPicbookFirestore()
  if (!db) return {}
  try {
    const snap = await getDocs(collection(db, COL))
    const out: Record<string, BookEdit> = {}
    for (const d of snap.docs) {
      const data = d.data() as Partial<BookEdit>
      out[d.id] = {
        panels: data.panels ?? {},
        texts: data.texts ?? {},
        reviewed: data.reviewed ?? [],
        updatedAt: data.updatedAt ?? '',
      }
    }
    return out
  } catch (e) {
    console.warn('[PicBook] 픽북 수정본 불러오기 실패', e)
    return {}
  }
}

/** 수정본 배포. 수정이 하나도 없으면 문서를 지워 원본으로 되돌린다. */
export async function publishBookEdit(bookId: string, edit: BookEdit): Promise<boolean> {
  const db = await getPicbookFirestore()
  if (!db) return false
  try {
    if (isBookEditEmpty(edit) && !edit.reviewed?.length) {
      await deleteDoc(doc(db, COL, bookId))
    } else {
      const clean = JSON.parse(JSON.stringify(edit)) as BookEdit
      await setDoc(doc(db, COL, bookId), { ...clean, updatedAt: new Date().toISOString() })
    }
    return true
  } catch (e) {
    console.warn('[PicBook] 픽북 수정본 배포 실패', e)
    return false
  }
}
