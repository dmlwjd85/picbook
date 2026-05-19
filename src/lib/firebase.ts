import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

export type FirebaseWebConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
  storageBucket?: string
  messagingSenderId?: string
}

/** 삼봉월드(sambong-world-2026)와 동일 프로젝트 — PicBook은 picbook_accounts 컬렉션만 사용 */
const SAMBONG_WORLD_FIREBASE_FALLBACK: FirebaseWebConfig = {
  apiKey: 'AIzaSyAsih-sfnIZ_gX_1l7SAVZHCAhk3KzmiP8',
  authDomain: 'sambong-world-2026.firebaseapp.com',
  projectId: 'sambong-world-2026',
  storageBucket: 'sambong-world-2026.firebasestorage.app',
  messagingSenderId: '728320769100',
  appId: '1:728320769100:web:7510c9a77cca6b87a788e9',
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

  if (!apiKey || !authDomain || !projectId || !appId) {
    return SAMBONG_WORLD_FIREBASE_FALLBACK
  }

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
let auth: Auth | null = null
let db: Firestore | null = null
let authReady: Promise<void> | null = null

export function isFirebaseEnabled(): boolean {
  return readConfig() != null
}

async function ensureFirebaseAuth(): Promise<void> {
  if (!auth) return
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true).catch(() => {})
    return
  }
  if (!authReady) {
    authReady = (async () => {
      await signInAnonymously(auth!)
      await auth!.currentUser?.getIdToken()
    })()
  }
  await authReady
}

/** PicBook 전용 Firestore — 삼봉월드와 동일 Firebase, 익명 인증 후 picbook_accounts 접근 */
export async function getPicbookFirestore(): Promise<Firestore | null> {
  if (!isFirebaseEnabled()) return null
  if (!app) {
    const config = readConfig()!
    app = initializeApp(config, 'picbook')
    auth = getAuth(app)
    db = getFirestore(app)
  }
  try {
    await ensureFirebaseAuth()
  } catch (e) {
    console.warn('[PicBook] Firebase 익명 로그인 실패', e)
    return null
  }
  return db
}
