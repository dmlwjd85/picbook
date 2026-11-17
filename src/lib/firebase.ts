import { initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage'

export type FirebaseWebConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
  storageBucket?: string
  messagingSenderId?: string
}

/**
 * PicBook 전용 Firebase 프로젝트(picbook-app-f0ce0)의 웹 설정.
 * 웹 설정값은 브라우저에 그대로 내려가는 공개 값이라 코드에 둬도 된다 — 접근 통제는 firestore.rules가 한다.
 * storageBucket은 Storage를 켠 뒤에 추가한다("picbook-app-f0ce0.firebasestorage.app").
 * 그 전까지 편집창에서 올린 그림은 올린 기기에만 저장되고 배포되지 않는다.
 */
const PICBOOK_FIREBASE_CONFIG: FirebaseWebConfig = {
  apiKey: 'AIzaSyAmA34l0F5fN4cgEDRfRctYgFK88-geMlE',
  authDomain: 'picbook-app-f0ce0.firebaseapp.com',
  projectId: 'picbook-app-f0ce0',
  messagingSenderId: '147099916012',
  appId: '1:147099916012:web:7a0070165c4d033c0937c9',
}

/**
 * 어떤 Firebase 프로젝트를 쓸지 정한다.
 * - 환경 변수(VITE_FIREBASE_CONFIG 등)가 있으면 그 프로젝트 (에뮬레이터·다른 프로젝트 시험용)
 * - 없으면: 배포 빌드는 위 PicBook 전용 프로젝트, 개발 서버(npm run dev)는 Firebase 없이
 *   이 기기에만 저장하는 체험 모드
 * 다른 서비스(삼봉월드 등)와 프로젝트를 공유하지 않는다. (docs/FIREBASE_SETUP.md)
 */
function readConfig(): FirebaseWebConfig | null {
  const raw = import.meta.env.VITE_FIREBASE_CONFIG as string | undefined
  if (raw?.trim()) {
    try {
      const parsed = JSON.parse(raw) as FirebaseWebConfig
      if (parsed.apiKey && parsed.projectId && parsed.appId) return parsed
      console.warn('[PicBook] VITE_FIREBASE_CONFIG에 apiKey·projectId·appId가 필요합니다')
    } catch {
      console.warn('[PicBook] VITE_FIREBASE_CONFIG JSON 파싱 실패')
    }
  }

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined

  if (!apiKey || !authDomain || !projectId || !appId) {
    return import.meta.env.PROD ? PICBOOK_FIREBASE_CONFIG : null
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

const config = readConfig()
const useEmulator = import.meta.env.VITE_FIREBASE_EMULATOR === '1'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

function ensureApp(): boolean {
  if (!config) return false
  if (app) return true
  app = initializeApp(config, 'picbook')
  auth = getAuth(app)
  db = getFirestore(app)
  storage = config.storageBucket ? getStorage(app) : null
  if (useEmulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    if (storage) connectStorageEmulator(storage, '127.0.0.1', 9199)
  }
  return true
}

export function isFirebaseEnabled(): boolean {
  return config != null
}

/** PicBook 전용 Firebase Auth — 미설정 시 null */
export function getPicbookAuth(): Auth | null {
  return ensureApp() ? auth : null
}

/**
 * PicBook 전용 Firestore — 미설정 시 null.
 * 읽기·쓰기 권한은 firestore.rules가 로그인 사용자(uid) 기준으로 판단한다.
 */
export async function getPicbookFirestore(): Promise<Firestore | null> {
  if (!ensureApp() || !auth) return null
  // 새로고침 직후 로그인 복원이 끝난 뒤에 요청해야 규칙이 uid를 본다
  await auth.authStateReady()
  return db
}

/** 그림 보관용 Storage — storageBucket 설정이 없으면 null */
export function getPicbookStorage(): FirebaseStorage | null {
  return ensureApp() ? storage : null
}
