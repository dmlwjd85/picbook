import { collection, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore'
import type { VisualDictionaryEntry } from '../types/visualDictionary'
import { getPicbookFirestore, isFirebaseEnabled } from './firebase'

export const VISUAL_DICTIONARY_COL = 'visual_dictionary'

export async function fetchAllVisualDictionary(): Promise<VisualDictionaryEntry[]> {
  const db = await getPicbookFirestore()
  if (!db) return []
  try {
    const snap = await getDocs(collection(db, VISUAL_DICTIONARY_COL))
    return snap.docs.map((d) => {
      const data = d.data() as VisualDictionaryEntry
      return { ...data, word_id: data.word_id || d.id }
    })
  } catch (e) {
    console.warn('[PicBook] visual_dictionary 로드 실패', e)
    return []
  }
}

export async function upsertVisualDictionaryEntries(entries: VisualDictionaryEntry[]): Promise<boolean> {
  const db = await getPicbookFirestore()
  if (!db || entries.length === 0) return false
  try {
    const batch = writeBatch(db)
    const now = new Date().toISOString()
    for (const entry of entries) {
      const ref = doc(db, VISUAL_DICTIONARY_COL, entry.word_id)
      batch.set(
        ref,
        {
          ...entry,
          updated_at: now,
        },
        { merge: true },
      )
    }
    await batch.commit()
    return true
  } catch (e) {
    console.warn('[PicBook] visual_dictionary 저장 실패', e)
    return false
  }
}

export async function publishStoryDictionary(
  storyId: string,
  entries: VisualDictionaryEntry[],
): Promise<boolean> {
  const db = await getPicbookFirestore()
  if (!db) return false
  try {
    await setDoc(
      doc(db, 'visual_dictionary_stories', storyId),
      {
        story_id: storyId,
        word_ids: entries.map((e) => e.word_id),
        updated_at: new Date().toISOString(),
      },
      { merge: true },
    )
    return await upsertVisualDictionaryEntries(entries)
  } catch (e) {
    console.warn('[PicBook] story dictionary 배포 실패', e)
    return false
  }
}

export function isVisualDictionaryCloudEnabled(): boolean {
  return isFirebaseEnabled()
}
