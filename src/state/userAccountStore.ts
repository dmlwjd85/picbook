import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { PERSIST_V1, migratePassthrough } from './persistVersion'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  createCloudUser,
  fetchCloudUser,
  fetchIsAdmin,
  isCloudSyncEnabled,
  pushCloudUser,
  type CloudUserDoc,
} from '../lib/accountCloudSync'
import {
  loginIdToEmail,
  normalizeLoginId,
  validateLoginId,
  validateNickname,
  validatePassword,
} from '../lib/accountRules'
import { getPicbookAuth, isFirebaseEnabled } from '../lib/firebase'
import { importCloudMasterData } from '../lib/importCloudMasterData'
import { fetchPasses, redeemPassKey, type RedeemResult } from '../lib/passes'
import { usePicbookSceneEditStore } from './picbookSceneEditStore'
import { usePicbookTimelineStore } from './picbookTimelineStore'

/** v1(이름+6자리 비밀번호)과 구조가 달라 새 키를 쓴다 */
const STORAGE_KEY = 'picbook.accounts.v2'

export type UserAccount = {
  /** Firebase Auth uid. 체험 모드(Firebase 미설정)는 `local:아이디` */
  uid: string
  loginId: string
  /** 닉네임 — 책장·랭킹에 표시 */
  name: string
  unlockedIds: string[]
  createdAt: string
  lastLoginAt: string
  /** 체험 모드 전용. Firebase 사용 시 비밀번호는 Firebase Auth만 보관한다. */
  localPasswordHash?: string
}

export type AuthResult = { ok: true } | { ok: false; error: string }

type UserAccountStore = {
  accounts: Record<string, UserAccount>
  /** 현재 로그인한 계정의 uid */
  sessionKey: string | null
  /** 관리자 여부 — 로그인할 때마다 서버(admins/{uid})에서 확인한다. 저장하지 않는다 */
  isAdmin: boolean
  /** 보유 이용권(분류 id 또는 'all') — 로그인할 때마다 서버에서 읽는다. 저장하지 않는다 */
  passes: string[]
  getActiveAccount: () => UserAccount | null
  register: (loginId: string, nickname: string, password: string) => Promise<AuthResult>
  login: (loginId: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  /** 앱 시작 시 Firebase 로그인 상태와 세션을 맞춘다 */
  syncAuthSession: () => Promise<void>
  /** 이용권 코드 등록 */
  redeemPass: (rawKey: string) => Promise<RedeemResult>
  isUnlocked: (bookId: string) => boolean
  unlock: (bookId: string) => void
  /** 서재·연출을 클라우드에 올림 */
  pushCloudSnapshot: () => Promise<void>
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string } | null)?.code ?? ''
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 사용 중인 아이디입니다. 다른 아이디를 골라 주세요.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return '아이디 또는 비밀번호가 맞지 않습니다.'
    case 'auth/weak-password':
      return '비밀번호가 너무 쉽습니다. 더 길게 만들어 주세요.'
    case 'auth/too-many-requests':
      return '시도가 너무 많습니다. 잠시 후 다시 해 주세요.'
    case 'auth/network-request-failed':
      return '인터넷 연결을 확인해 주세요.'
    case 'auth/operation-not-allowed':
      return '회원가입이 아직 열려 있지 않습니다. (Firebase 콘솔에서 이메일/비밀번호 로그인을 켜 주세요)'
    default:
      console.warn('[PicBook] 인증 오류', e)
      return '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  }
}

/** 클라우드 회원 문서를 로컬 계정으로 반영하고 연출 데이터를 병합 */
function accountFromCloud(
  uid: string,
  cloud: CloudUserDoc,
  local: UserAccount | undefined,
  now: string,
): UserAccount {
  return {
    uid,
    loginId: cloud.loginId || local?.loginId || '',
    name: cloud.nickname || local?.name || '',
    unlockedIds: [...new Set([...(local?.unlockedIds ?? []), ...cloud.unlockedIds])],
    createdAt: cloud.createdAt || local?.createdAt || now,
    lastLoginAt: now,
  }
}

export const useUserAccountStore = create<UserAccountStore>()(
  persist(
    (set, get) => ({
      accounts: {},
      sessionKey: null,
      isAdmin: false,
      passes: [],

      getActiveAccount: () => {
        const key = get().sessionKey
        if (!key) return null
        return get().accounts[key] ?? null
      },

      register: async (rawLoginId, rawNickname, password) => {
        const invalid =
          validateLoginId(rawLoginId) ?? validateNickname(rawNickname) ?? validatePassword(password)
        if (invalid) return { ok: false, error: invalid }
        const loginId = normalizeLoginId(rawLoginId)
        const nickname = rawNickname.trim()
        const now = new Date().toISOString()

        if (!isFirebaseEnabled()) {
          const uid = `local:${loginId}`
          if (get().accounts[uid]) return { ok: false, error: '이미 사용 중인 아이디입니다.' }
          const account: UserAccount = {
            uid,
            loginId,
            name: nickname,
            unlockedIds: [],
            createdAt: now,
            lastLoginAt: now,
            localPasswordHash: await sha256(`${loginId}:${password}`),
          }
          set((s) => ({ accounts: { ...s.accounts, [uid]: account }, sessionKey: uid }))
          return { ok: true }
        }

        const auth = getPicbookAuth()
        if (!auth) return { ok: false, error: 'Firebase에 연결하지 못했습니다.' }
        let uid: string
        try {
          const cred = await createUserWithEmailAndPassword(auth, loginIdToEmail(loginId), password)
          uid = cred.user.uid
          await updateProfile(cred.user, { displayName: nickname })
        } catch (e) {
          return { ok: false, error: authErrorMessage(e) }
        }
        try {
          await createCloudUser(uid, { loginId, nickname, createdAt: now })
        } catch (e) {
          // 계정은 만들어졌으므로 로그인은 유지한다 — 회원 문서는 다음 로그인 때 다시 만든다
          console.warn('[PicBook] 회원 문서 생성 실패', e)
        }
        const account: UserAccount = {
          uid,
          loginId,
          name: nickname,
          unlockedIds: [],
          createdAt: now,
          lastLoginAt: now,
        }
        set((s) => ({ accounts: { ...s.accounts, [uid]: account }, sessionKey: uid, isAdmin: false, passes: [] }))
        return { ok: true }
      },

      login: async (rawLoginId, password) => {
        const loginId = normalizeLoginId(rawLoginId)
        if (!loginId) return { ok: false, error: '아이디를 입력해 주세요.' }
        if (!password) return { ok: false, error: '비밀번호를 입력해 주세요.' }
        const now = new Date().toISOString()

        if (!isFirebaseEnabled()) {
          const uid = `local:${loginId}`
          const account = get().accounts[uid]
          if (!account || account.localPasswordHash !== (await sha256(`${loginId}:${password}`))) {
            return { ok: false, error: '아이디 또는 비밀번호가 맞지 않습니다.' }
          }
          set((s) => ({
            sessionKey: uid,
            accounts: { ...s.accounts, [uid]: { ...account, lastLoginAt: now } },
          }))
          return { ok: true }
        }

        const auth = getPicbookAuth()
        if (!auth) return { ok: false, error: 'Firebase에 연결하지 못했습니다.' }
        let uid: string
        let displayName: string
        try {
          const cred = await signInWithEmailAndPassword(auth, loginIdToEmail(loginId), password)
          uid = cred.user.uid
          displayName = cred.user.displayName ?? loginId
        } catch (e) {
          return { ok: false, error: authErrorMessage(e) }
        }

        let cloud: CloudUserDoc | null = null
        try {
          cloud = await fetchCloudUser(uid)
          if (!cloud) {
            await createCloudUser(uid, { loginId, nickname: displayName, createdAt: now })
            cloud = await fetchCloudUser(uid)
          }
        } catch (e) {
          console.warn('[PicBook] 회원 정보 불러오기 실패', e)
        }

        const local = get().accounts[uid]
        const account: UserAccount = cloud
          ? accountFromCloud(uid, cloud, local, now)
          : {
              uid,
              loginId,
              name: local?.name ?? displayName,
              unlockedIds: local?.unlockedIds ?? [],
              createdAt: local?.createdAt ?? now,
              lastLoginAt: now,
            }
        if (cloud) importCloudMasterData(cloud)
        set((s) => ({ accounts: { ...s.accounts, [uid]: account }, sessionKey: uid }))
        set({ isAdmin: await fetchIsAdmin(uid), passes: await fetchPasses(uid) })
        await get().pushCloudSnapshot()
        return { ok: true }
      },

      logout: async () => {
        set({ sessionKey: null, isAdmin: false, passes: [] })
        const auth = getPicbookAuth()
        if (auth) await signOut(auth).catch(() => {})
      },

      syncAuthSession: async () => {
        const auth = getPicbookAuth()
        if (!auth) return
        await auth.authStateReady()
        const user = auth.currentUser
        const sessionKey = get().sessionKey
        if (!user) {
          // 다른 탭에서 로그아웃했거나 로그인 정보가 지워진 경우
          if (sessionKey) set({ sessionKey: null })
          return
        }
        set({ isAdmin: await fetchIsAdmin(user.uid), passes: await fetchPasses(user.uid) })
        if (sessionKey === user.uid && get().accounts[user.uid]) return
        const now = new Date().toISOString()
        const cloud = await fetchCloudUser(user.uid).catch(() => null)
        if (!cloud) {
          set({ sessionKey: null })
          await signOut(auth).catch(() => {})
          return
        }
        importCloudMasterData(cloud)
        const account = accountFromCloud(user.uid, cloud, get().accounts[user.uid], now)
        set((s) => ({ accounts: { ...s.accounts, [user.uid]: account }, sessionKey: user.uid }))
      },

      redeemPass: async (rawKey) => {
        const uid = get().sessionKey
        if (!uid) return { ok: false, error: '먼저 로그인해 주세요.' }
        const result = await redeemPassKey(uid, rawKey)
        if (result.ok) set((s) => ({ passes: [...new Set([...s.passes, result.pass])] }))
        return result
      },

      isUnlocked: (bookId) => {
        const acc = get().getActiveAccount()
        return acc?.unlockedIds.includes(bookId) ?? false
      },

      unlock: (bookId) => {
        const key = get().sessionKey
        if (!key) return
        set((s) => {
          const acc = s.accounts[key]
          if (!acc || acc.unlockedIds.includes(bookId)) return s
          return {
            accounts: {
              ...s.accounts,
              [key]: { ...acc, unlockedIds: [...acc.unlockedIds, bookId] },
            },
          }
        })
        void get().pushCloudSnapshot()
      },

      pushCloudSnapshot: async () => {
        if (!isCloudSyncEnabled()) return
        const acc = get().getActiveAccount()
        const auth = getPicbookAuth()
        if (!acc || !auth || auth.currentUser?.uid !== acc.uid) return
        await pushCloudUser(acc.uid, {
          unlockedIds: acc.unlockedIds,
          timelines: usePicbookTimelineStore.getState().byBook,
          sceneEditsByBook: usePicbookSceneEditStore.getState().editsByBook,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      version: PERSIST_V1,
      migrate: migratePassthrough,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ accounts: s.accounts, sessionKey: s.sessionKey }),
    },
  ),
)
