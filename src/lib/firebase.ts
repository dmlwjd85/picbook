import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

export type FirebaseWebConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
  storageBucket?: string
  messagingSenderId?: string
}

function readConfig(): FirebaseWebConfig | null {
  const raw = import.meta.env.VITE_FIREBASE_CONFIG as string | undefined
  if (raw?.trim()) {
    try {
      return JSON.parse(raw) as FirebaseWebConfig
    } catch {
      console.warn('[PicBook] VITE_FIREBASE_CONFIG JSON 파싱 실패')
    }
  }

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined

  if (!apiKey || !authDomain || !projectId || !appId) return null

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  }
}

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function isFirebaseEnabled(): boolean {
  return readConfig() != null
}

/** PicBook 전용 Firestore (다른 앱 컬렉션과 분리) */
export function getPicbookFirestore(): Firestore | null {
  if (!isFirebaseEnabled()) return null
  if (!app) {
    const config = readConfig()!
    app = initializeApp(config, 'picbook')
  }
  if (!db) db = getFirestore(app)
  return db
}
