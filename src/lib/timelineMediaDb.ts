/** 타임라인 커스텀 이미지·오디오 — IndexedDB */

const DB_NAME = 'picbook-timeline-media'
const DB_VERSION = 1
const STORE_IMAGES = 'images'
const STORE_AUDIO = 'audio'

const urlCache = new Map<string, string>()

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES)
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO)
      }
    }
  })
}

export function makeTimelineMediaKey(bookId: string, sentenceId: string, suffix: string): string {
  return `${bookId}/${sentenceId}/${suffix}`
}

export async function putTimelineImage(key: string, blob: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_IMAGES, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE_IMAGES).put(blob, key)
  })
  db.close()
  const cached = urlCache.get(`img:${key}`)
  if (cached) {
    URL.revokeObjectURL(cached)
    urlCache.delete(`img:${key}`)
  }
}

export async function putTimelineAudio(key: string, blob: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE_AUDIO).put(blob, key)
  })
  db.close()
  const cached = urlCache.get(`aud:${key}`)
  if (cached) {
    URL.revokeObjectURL(cached)
    urlCache.delete(`aud:${key}`)
  }
}

export async function deleteTimelineImage(key: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_IMAGES, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE_IMAGES).delete(key)
  })
  db.close()
  const cached = urlCache.get(`img:${key}`)
  if (cached) {
    URL.revokeObjectURL(cached)
    urlCache.delete(`img:${key}`)
  }
}

async function getBlob(storeName: string, key: string): Promise<Blob | null> {
  const db = await openDb()
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    tx.onerror = () => reject(tx.error)
    const req = tx.objectStore(storeName).get(key)
    req.onsuccess = () => resolve((req.result as Blob) ?? null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return blob
}

export async function getTimelineImageObjectUrl(key: string): Promise<string | null> {
  const cacheKey = `img:${key}`
  const hit = urlCache.get(cacheKey)
  if (hit) return hit
  const blob = await getBlob(STORE_IMAGES, key)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(cacheKey, url)
  return url
}

export async function getTimelineAudioObjectUrl(key: string): Promise<string | null> {
  const cacheKey = `aud:${key}`
  const hit = urlCache.get(cacheKey)
  if (hit) return hit
  const blob = await getBlob(STORE_AUDIO, key)
  if (!blob) return null
  const url = URL.createObjectURL(blob)
  urlCache.set(cacheKey, url)
  return url
}

/** 컴포넌트 언마운트 시 object URL 정리 */
export function revokeTimelineObjectUrl(url: string): void {
  for (const [k, v] of urlCache.entries()) {
    if (v === url) {
      URL.revokeObjectURL(v)
      urlCache.delete(k)
      return
    }
  }
  try {
    URL.revokeObjectURL(url)
  } catch {
    /* ignore */
  }
}
