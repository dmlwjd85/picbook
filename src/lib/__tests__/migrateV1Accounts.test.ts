// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  LOCAL_PASSWORD_PBKDF2_PREFIX,
  hashLocalPassword,
  verifyLocalPassword,
} from '../passwordHash'
import {
  copyTypingRecordsForMigratedAccounts,
  mergeV1AccountsIntoV2,
  parseV1Accounts,
} from '../migrateV1Accounts'
import type { UserAccount } from '../../state/userAccountStore'

const NOW = '2026-11-20T01:00:00.000Z'

function v1Payload(accounts: Record<string, unknown>, sessionKey: string | null = null) {
  return JSON.stringify({ state: { accounts, sessionKey }, version: 0 })
}

function v2Account(partial: Partial<UserAccount> & Pick<UserAccount, 'uid' | 'loginId' | 'name'>): UserAccount {
  return {
    unlockedIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-02T00:00:00.000Z',
    ...partial,
  }
}

describe('passwordHash', () => {
  it('PBKDF2 해시는 솔트를 포함하고 평문을 남기지 않으며, 같은 비밀번호만 통과한다', async () => {
    const hash = await hashLocalPassword('123456')
    expect(hash.startsWith(`${LOCAL_PASSWORD_PBKDF2_PREFIX}$`)).toBe(true)
    expect(hash.includes('123456')).toBe(false)
    const again = await hashLocalPassword('123456')
    expect(again).not.toBe(hash)
    expect(await verifyLocalPassword('kim', '123456', hash)).toBe(true)
    expect(await verifyLocalPassword('kim', '000000', hash)).toBe(false)
  })

  it('예전 SHA-256(아이디:비밀번호) 형식도 확인한다', async () => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mina:secret12'))
    const legacy = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    expect(await verifyLocalPassword('mina', 'secret12', legacy)).toBe(true)
    expect(await verifyLocalPassword('mina', 'wrong', legacy)).toBe(false)
    expect(await verifyLocalPassword('other', 'secret12', legacy)).toBe(false)
  })
})

describe('parseV1Accounts', () => {
  it('없는 값·빈 문자열은 빈 결과로 본다', () => {
    expect(parseV1Accounts(null)).toEqual({ accounts: {}, sessionKey: null })
    expect(parseV1Accounts('')).toEqual({ accounts: {}, sessionKey: null })
    expect(parseV1Accounts('   ')).toEqual({ accounts: {}, sessionKey: null })
  })

  it('깨진 JSON은 null을 돌려준다', () => {
    expect(parseV1Accounts('{not json')).toBeNull()
    expect(parseV1Accounts('[]')).toBeNull()
    expect(parseV1Accounts(JSON.stringify({ state: { accounts: ['bad'] } }))).toBeNull()
  })
})

describe('mergeV1AccountsIntoV2', () => {
  const v1Only = v1Payload(
    {
      김학생: {
        name: '김학생',
        password: '123456',
        unlockedIds: ['elementary-proverbs'],
        createdAt: '2026-03-01T00:00:00.000Z',
        lastLoginAt: '2026-03-02T00:00:00.000Z',
      },
    },
    '김학생',
  )

  it('v1만 있으면 v2 형태로 옮기고, 비밀번호는 해시로만 저장하며, 세션을 이어 준다', async () => {
    const result = await mergeV1AccountsIntoV2(v1Only, { accounts: {}, sessionKey: null }, NOW)
    expect(result.error).toBeNull()
    expect(result.migrated).toEqual(['local:김학생'])
    expect(result.skipped).toEqual([])
    const acc = result.accounts['local:김학생']
    expect(acc).toMatchObject({
      uid: 'local:김학생',
      loginId: '김학생',
      name: '김학생',
      unlockedIds: ['elementary-proverbs'],
      createdAt: '2026-03-01T00:00:00.000Z',
      lastLoginAt: '2026-03-02T00:00:00.000Z',
    })
    expect(acc.localPasswordHash).toBeTruthy()
    expect(JSON.stringify(result.accounts).includes('123456')).toBe(false)
    expect(acc.localPasswordHash?.startsWith(`${LOCAL_PASSWORD_PBKDF2_PREFIX}$`)).toBe(true)
    expect(await verifyLocalPassword('김학생', '123456', acc.localPasswordHash)).toBe(true)
    expect(result.sessionKey).toBe('local:김학생')
  })

  it('v1과 v2에 같은 이름이 있으면 v2를 덮지 않고 건너뛴다', async () => {
    const existing = v2Account({
      uid: 'local:김학생',
      loginId: '김학생',
      name: '이미 있는 계정',
      unlockedIds: ['keep-me'],
      localPasswordHash: 'existing-hash',
    })
    const result = await mergeV1AccountsIntoV2(
      v1Only,
      { accounts: { 'local:김학생': existing }, sessionKey: 'local:김학생' },
      NOW,
    )
    expect(result.migrated).toEqual([])
    expect(result.skipped).toEqual(['김학생'])
    expect(result.accounts['local:김학생']).toEqual(existing)
    expect(result.sessionKey).toBe('local:김학생')
  })

  it('같은 loginId의 Firebase 계정이 있어도 로컬 계정을 새로 만들지 않는다', async () => {
    const cloud = v2Account({
      uid: 'firebase-uid',
      loginId: 'mina',
      name: 'Mina',
    })
    const result = await mergeV1AccountsIntoV2(
      v1Payload({ mina: { name: 'Mina', password: '654321', unlockedIds: ['old'] } }),
      { accounts: { 'firebase-uid': cloud }, sessionKey: 'firebase-uid' },
      NOW,
    )
    expect(result.migrated).toEqual([])
    expect(result.skipped).toEqual(['mina'])
    expect(result.accounts).toEqual({ 'firebase-uid': cloud })
    expect(Object.keys(result.accounts)).toHaveLength(1)
  })

  it('깨진 JSON이면 v2를 그대로 두고 오류만 표시한다', async () => {
    const existing = v2Account({ uid: 'uid-a', loginId: 'aaa1', name: 'A' })
    const result = await mergeV1AccountsIntoV2('{broken', {
      accounts: { 'uid-a': existing },
      sessionKey: 'uid-a',
    }, NOW)
    expect(result.error).toBe('invalid-json')
    expect(result.migrated).toEqual([])
    expect(result.accounts).toEqual({ 'uid-a': existing })
    expect(result.sessionKey).toBe('uid-a')
  })

  it('빈 값이면 아무 것도 바꾸지 않는다', async () => {
    const existing = v2Account({ uid: 'uid-a', loginId: 'aaa1', name: 'A' })
    for (const raw of [null, '', '   ']) {
      const result = await mergeV1AccountsIntoV2(raw, {
        accounts: { 'uid-a': existing },
        sessionKey: 'uid-a',
      }, NOW)
      expect(result.error).toBeNull()
      expect(result.migrated).toEqual([])
      expect(result.accounts).toEqual({ 'uid-a': existing })
    }
  })

  it('여러 번 실행해도 계정이 한 번만 생긴다', async () => {
    const first = await mergeV1AccountsIntoV2(v1Only, { accounts: {}, sessionKey: null }, NOW)
    const second = await mergeV1AccountsIntoV2(v1Only, {
      accounts: first.accounts,
      sessionKey: first.sessionKey,
    }, NOW)
    expect(second.migrated).toEqual([])
    expect(second.skipped).toEqual(['김학생'])
    expect(Object.keys(second.accounts)).toEqual(['local:김학생'])
    expect(second.accounts['local:김학생']).toEqual(first.accounts['local:김학생'])
  })

  it('한 건은 옮기고 같은 이름의 한 건은 건너뛴다', async () => {
    const existing = v2Account({ uid: 'local:keep', loginId: 'keep', name: 'keep' })
    const result = await mergeV1AccountsIntoV2(
      v1Payload({
        keep: { name: 'keep', password: '111111', unlockedIds: ['old'] },
        새이름: { name: '새이름', password: '222222', unlockedIds: ['new-book'] },
      }),
      { accounts: { 'local:keep': existing }, sessionKey: null },
      NOW,
    )
    expect(result.migrated).toEqual(['local:새이름'])
    expect(result.skipped).toEqual(['keep'])
    expect(result.accounts['local:keep']).toEqual(existing)
    expect(result.accounts['local:새이름']?.unlockedIds).toEqual(['new-book'])
  })
})

describe('copyTypingRecordsForMigratedAccounts', () => {
  it('예전 키의 타자 기록을 새 uid로 복사하고 원본 키는 남긴다', () => {
    const record = {
      bookId: 'b1',
      bookTitle: '책',
      sentence: '안녕',
      cpm: 100,
      accuracy: 99,
      chars: 10,
      at: '2026-03-01T00:00:00.000Z',
    }
    const next = copyTypingRecordsForMigratedAccounts(
      { 김학생: [record] },
      [{ fromKey: '김학생', toUid: 'local:김학생' }],
    )
    expect(next['김학생']).toEqual([record])
    expect(next['local:김학생']).toEqual([record])
    expect(next['local:김학생']).not.toBe(next['김학생'])
  })

  it('새 uid에 이미 기록이 있으면 덮지 않는다', () => {
    const oldRec = {
      bookId: 'old',
      bookTitle: '예전',
      sentence: '옛',
      cpm: 80,
      accuracy: 90,
      chars: 8,
      at: '2026-01-01T00:00:00.000Z',
    }
    const newRec = { ...oldRec, bookId: 'new', sentence: '새' }
    const next = copyTypingRecordsForMigratedAccounts(
      { 김학생: [oldRec], 'local:김학생': [newRec] },
      [{ fromKey: '김학생', toUid: 'local:김학생' }],
    )
    expect(next['local:김학생']).toEqual([newRec])
  })
})
