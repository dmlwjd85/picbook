import type { UserAccount } from '../state/userAccountStore'
import type { TypingRecord } from './typingRecords'
import { hashLocalPassword } from './passwordHash'

export const V1_ACCOUNTS_KEY = 'picbook.accounts.v1'

export type MigrateV1Result = {
  accounts: Record<string, UserAccount>
  sessionKey: string | null
  migrated: string[]
  skipped: string[]
  /** 파싱 실패 등. 빈 값·없는 키는 오류가 아니다. */
  error: string | null
}

export function localUidFromV1Key(key: string): string {
  return `local:${key}`
}

type V1AccountRaw = {
  name?: unknown
  password?: unknown
  unlockedIds?: unknown
  createdAt?: unknown
  lastLoginAt?: unknown
}

type V1Parsed = {
  accounts: Record<string, V1AccountRaw>
  sessionKey: string | null
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** v1 저장 문자열을 읽는다. 없거나 비어 있으면 빈 결과, 깨진 JSON은 null. */
export function parseV1Accounts(raw: string | null): V1Parsed | null {
  if (raw == null || raw.trim() === '') return { accounts: {}, sessionKey: null }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isPlainObject(parsed)) return null
  const state = isPlainObject(parsed.state) ? parsed.state : parsed
  const accountsRaw = state.accounts
  if (accountsRaw == null) return { accounts: {}, sessionKey: null }
  if (!isPlainObject(accountsRaw)) return null
  const sessionKey = typeof state.sessionKey === 'string' ? state.sessionKey : null
  return { accounts: accountsRaw as Record<string, V1AccountRaw>, sessionKey }
}

function v1KeyOf(storedKey: string, acc: V1AccountRaw): string | null {
  if (typeof acc.name === 'string' && acc.name.trim()) {
    return acc.name.trim().toLowerCase()
  }
  const key = storedKey.trim().toLowerCase()
  return key || null
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function alreadyInV2(accounts: Record<string, UserAccount>, loginId: string, uid: string): boolean {
  if (accounts[uid]) return true
  return Object.values(accounts).some((acc) => acc.loginId === loginId)
}

/**
 * v1 계정을 v2 형태로 합친다. v1 원본은 건드리지 않는다.
 * 같은 아이디가 v2에 있으면 그 항목은 건너뛰어 중복을 만들지 않는다.
 * 비밀번호는 평문으로 넣지 않고 해시만 저장한다.
 */
export async function mergeV1AccountsIntoV2(
  v1Raw: string | null,
  current: { accounts: Record<string, UserAccount>; sessionKey: string | null },
  now = new Date().toISOString(),
): Promise<MigrateV1Result> {
  const parsed = parseV1Accounts(v1Raw)
  if (!parsed) {
    return {
      accounts: current.accounts,
      sessionKey: current.sessionKey,
      migrated: [],
      skipped: [],
      error: 'invalid-json',
    }
  }

  const accounts = { ...current.accounts }
  const migrated: string[] = []
  const skipped: string[] = []
  let sessionKey = current.sessionKey
  const migratedFromSession: string[] = []

  for (const [storedKey, raw] of Object.entries(parsed.accounts)) {
    if (!isPlainObject(raw)) {
      skipped.push(storedKey)
      continue
    }
    const loginId = v1KeyOf(storedKey, raw)
    if (!loginId) {
      skipped.push(storedKey)
      continue
    }
    const uid = localUidFromV1Key(loginId)
    if (alreadyInV2(accounts, loginId, uid)) {
      skipped.push(storedKey)
      continue
    }

    const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : loginId
    let localPasswordHash: string | undefined
    if (typeof raw.password === 'string' && raw.password.length > 0) {
      localPasswordHash = await hashLocalPassword(raw.password)
    }

    accounts[uid] = {
      uid,
      loginId,
      name,
      unlockedIds: stringList(raw.unlockedIds),
      createdAt: typeof raw.createdAt === 'string' && raw.createdAt ? raw.createdAt : now,
      lastLoginAt: typeof raw.lastLoginAt === 'string' && raw.lastLoginAt ? raw.lastLoginAt : now,
      ...(localPasswordHash ? { localPasswordHash } : {}),
    }
    migrated.push(uid)
    if (parsed.sessionKey && parsed.sessionKey.trim().toLowerCase() === loginId) {
      migratedFromSession.push(uid)
    }
  }

  if (!sessionKey && migratedFromSession[0]) sessionKey = migratedFromSession[0]

  return { accounts, sessionKey, migrated, skipped, error: null }
}

/** 예전 계정 키로 남아 있는 타자 기록을 새 uid로 복사한다. 원본 키는 지우지 않는다. */
export function copyTypingRecordsForMigratedAccounts(
  byUser: Record<string, TypingRecord[]>,
  migrations: Array<{ fromKey: string; toUid: string }>,
): Record<string, TypingRecord[]> {
  const next = { ...byUser }
  for (const { fromKey, toUid } of migrations) {
    const source = byUser[fromKey]
    if (!source || source.length === 0) continue
    if (next[toUid]?.length) continue
    next[toUid] = source.map((record) => ({ ...record }))
  }
  return next
}

export function v1KeysForMigrations(v1Raw: string | null, migratedUids: string[]): Array<{ fromKey: string; toUid: string }> {
  const parsed = parseV1Accounts(v1Raw)
  if (!parsed) return []
  const out: Array<{ fromKey: string; toUid: string }> = []
  const migrated = new Set(migratedUids)
  for (const [storedKey, raw] of Object.entries(parsed.accounts)) {
    if (!isPlainObject(raw)) continue
    const loginId = v1KeyOf(storedKey, raw)
    if (!loginId) continue
    const uid = localUidFromV1Key(loginId)
    if (!migrated.has(uid)) continue
    out.push({ fromKey: storedKey, toUid: uid })
    if (storedKey !== loginId) out.push({ fromKey: loginId, toUid: uid })
  }
  return out
}
