import { accountKeyFromName, type UserAccount } from '../state/userAccountStore'
import type { SentenceTimeline } from '../types/timeline'
import type { PanelSceneEdit } from '../types/sceneEdit'

/** GitHub Pages 빌드 시 VITE_ACCOUNT_SYNC_URL 로 Workers 배포 주소 지정 */
export const ACCOUNT_SYNC_URL = (import.meta.env.VITE_ACCOUNT_SYNC_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export type CloudAccountPayload = {
  name: string
  password: string
  unlockedIds: string[]
  /** bookId → sentenceId → timeline */
  timelines: Record<string, Record<string, SentenceTimeline>>
  /** bookId → panelKey → 연출 */
  sceneEditsByBook: Record<string, Record<string, PanelSceneEdit>>
  updatedAt: string
}

export function isCloudSyncEnabled(): boolean {
  return ACCOUNT_SYNC_URL.length > 0
}

/** 이름·비밀번호로만 계산 — 서버에 저장 키 */
export async function cloudAccountId(name: string, password: string): Promise<string> {
  const raw = `${accountKeyFromName(name)}:${password}`
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function fetchCloudAccount(
  name: string,
  password: string,
): Promise<CloudAccountPayload | null> {
  if (!isCloudSyncEnabled()) return null
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

export async function pushCloudAccount(payload: CloudAccountPayload): Promise<boolean> {
  if (!isCloudSyncEnabled()) return false
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

/** 로컬·클라우드 병합 — 구매·연출은 합집합, 타임스탬프는 클라우드 우선 */
export function mergeCloudIntoLocal(
  local: UserAccount,
  cloud: CloudAccountPayload,
): UserAccount {
  const mergedUnlocks = [...new Set([...local.unlockedIds, ...cloud.unlockedIds])]
  return {
    ...local,
    unlockedIds: mergedUnlocks,
    lastLoginAt: new Date().toISOString(),
  }
}
