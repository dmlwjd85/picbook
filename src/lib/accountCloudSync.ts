import { accountKeyFromName, type UserAccount } from '../state/userAccountStore'
import type { SentenceTimeline } from '../types/timeline'
import type { PanelSceneEdit } from '../types/sceneEdit'
import {
  fetchFirebaseAccount,
  firebaseAccountExists,
  pushFirebaseAccount,
} from './firebaseAccountSync'
import { isFirebaseEnabled } from './firebase'

/** (선택) Cloudflare Worker 동기화 — Firebase 미설정 시 대체 */
export const ACCOUNT_SYNC_URL = (import.meta.env.VITE_ACCOUNT_SYNC_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export type CloudAccountPayload = {
  name: string
  password: string
  unlockedIds: string[]
  timelines: Record<string, Record<string, SentenceTimeline>>
  sceneEditsByBook: Record<string, Record<string, PanelSceneEdit>>
  updatedAt: string
}

export function isWorkerSyncEnabled(): boolean {
  return ACCOUNT_SYNC_URL.length > 0
}

/** Firebase 또는 Worker 중 하나라도 설정되면 기기 간 연동 가능 */
export function isCloudSyncEnabled(): boolean {
  return isFirebaseEnabled() || isWorkerSyncEnabled()
}

export function isFirebaseSyncEnabled(): boolean {
  return isFirebaseEnabled()
}

async function cloudAccountId(name: string, password: string): Promise<string> {
  const raw = `${accountKeyFromName(name)}:${password}`
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function fetchWorkerAccount(name: string, password: string): Promise<CloudAccountPayload | null> {
  if (!isWorkerSyncEnabled()) return null
  const id = await cloudAccountId(name, password)
  try {
    const res = await fetch(`${ACCOUNT_SYNC_URL}/account/${id}`, { method: 'GET' })
    if (res.status === 404) return null
    if (!res.ok) return null
    const data = (await res.json()) as CloudAccountPayload
    if (data.password !== password) return null
    return data
  } catch {
    return null
  }
}

async function pushWorkerAccount(payload: CloudAccountPayload): Promise<boolean> {
  if (!isWorkerSyncEnabled()) return false
  try {
    const id = await cloudAccountId(payload.name, payload.password)
    const res = await fetch(`${ACCOUNT_SYNC_URL}/account/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, updatedAt: new Date().toISOString() }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** Firebase 우선, Worker 보조 */
export async function fetchCloudAccount(
  name: string,
  password: string,
): Promise<CloudAccountPayload | null> {
  const fromFirebase = await fetchFirebaseAccount(name, password)
  if (fromFirebase) return fromFirebase
  return fetchWorkerAccount(name, password)
}

/** 원격에 같은 이름 계정이 있는지 (가입 중복 방지) */
export async function remoteAccountExists(name: string): Promise<boolean> {
  const key = accountKeyFromName(name)
  if (isFirebaseEnabled()) {
    if (await firebaseAccountExists(key)) return true
  }
  return false
}

export async function pushCloudAccount(payload: CloudAccountPayload): Promise<boolean> {
  const account: UserAccount = {
    name: payload.name,
    password: payload.password,
    unlockedIds: payload.unlockedIds,
    createdAt: payload.updatedAt,
    lastLoginAt: payload.updatedAt,
  }

  if (isFirebaseEnabled()) {
    const ok = await pushFirebaseAccount(account, payload.timelines, payload.sceneEditsByBook)
    if (ok) return true
  }

  return pushWorkerAccount(payload)
}

export function accountToCloudPayload(
  account: UserAccount,
  timelines: Record<string, Record<string, SentenceTimeline>>,
  sceneEditsByBook: Record<string, Record<string, PanelSceneEdit>>,
): CloudAccountPayload {
  return {
    name: account.name,
    password: account.password,
    unlockedIds: account.unlockedIds,
    timelines,
    sceneEditsByBook,
    updatedAt: new Date().toISOString(),
  }
}

export function mergeCloudIntoLocal(local: UserAccount, cloud: CloudAccountPayload): UserAccount {
  const mergedUnlocks = [...new Set([...local.unlockedIds, ...cloud.unlockedIds])]
  return {
    ...local,
    unlockedIds: mergedUnlocks,
    lastLoginAt: new Date().toISOString(),
  }
}
