// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { V1_ACCOUNTS_KEY } from '../../lib/migrateV1Accounts'
import { LOCAL_PASSWORD_PBKDF2_PREFIX } from '../../lib/passwordHash'

const V2_KEY = 'picbook.accounts.v2'

const v1Raw = JSON.stringify({
  state: {
    accounts: {
      김학생: {
        name: '김학생',
        password: '123456',
        unlockedIds: ['elementary-proverbs'],
        createdAt: '2026-03-01T00:00:00.000Z',
        lastLoginAt: '2026-03-02T00:00:00.000Z',
      },
    },
    sessionKey: '김학생',
  },
  version: 0,
})

const typingRecord = {
  bookId: 'b1',
  bookTitle: '속담',
  sentence: '호랑이도 제 말하면 온다',
  cpm: 110,
  accuracy: 97,
  chars: 12,
  at: '2026-03-02T00:00:00.000Z',
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.resetModules()
})

async function loadStores() {
  const { useUserAccountStore } = await import('../userAccountStore')
  const { useTypingRecordStore } = await import('../typingRecordStore')
  const { runV1AccountMigration } = await import('../../lib/runV1AccountMigration')
  await new Promise((r) => setTimeout(r, 0))
  return { useUserAccountStore, useTypingRecordStore, runV1AccountMigration }
}

describe('예전 계정 이전 후 로그인', () => {
  it('v1만 있는 기기에서 이전 후 예전 비밀번호로 로그인되고, v1 원본은 남는다', async () => {
    localStorage.setItem(V1_ACCOUNTS_KEY, v1Raw)
    localStorage.setItem(
      'picbook.typing-records.v1',
      JSON.stringify({ state: { byUser: { 김학생: [typingRecord] } }, version: 0 }),
    )

    const { useUserAccountStore, useTypingRecordStore, runV1AccountMigration } = await loadStores()
    const first = await runV1AccountMigration()
    expect(first.error).toBeNull()
    expect(first.migrated).toEqual(['local:김학생'])

    const acc = useUserAccountStore.getState().accounts['local:김학생']
    expect(acc.unlockedIds).toEqual(['elementary-proverbs'])
    expect(acc.localPasswordHash?.startsWith(`${LOCAL_PASSWORD_PBKDF2_PREFIX}$`)).toBe(true)
    expect(useUserAccountStore.getState().sessionKey).toBe('local:김학생')
    expect(useTypingRecordStore.getState().byUser['local:김학생']).toEqual([typingRecord])
    expect(useTypingRecordStore.getState().byUser['김학생']).toEqual([typingRecord])

    expect(localStorage.getItem(V1_ACCOUNTS_KEY)).toBe(v1Raw)
    const storedV2 = localStorage.getItem(V2_KEY) ?? ''
    expect(storedV2.includes('123456')).toBe(false)

    useUserAccountStore.setState({ sessionKey: null })
    const login = await useUserAccountStore.getState().login('김학생', '123456')
    expect(login).toEqual({ ok: true })
    expect(useUserAccountStore.getState().sessionKey).toBe('local:김학생')

    const wrong = await useUserAccountStore.getState().login('김학생', '000000')
    expect(wrong).toEqual({ ok: false, error: '아이디 또는 비밀번호가 맞지 않습니다.' })

    const second = await runV1AccountMigration()
    expect(second.migrated).toEqual([])
    expect(Object.keys(useUserAccountStore.getState().accounts)).toEqual(['local:김학생'])
    expect(localStorage.getItem(V1_ACCOUNTS_KEY)).toBe(v1Raw)
  })

  it('이미 v2에 같은 이름이 있으면 이전하지 않고 기존 비밀번호로 로그인한다', async () => {
    const { hashLocalPassword } = await import('../../lib/passwordHash')
    const hash = await hashLocalPassword('newpass12')
    localStorage.setItem(V1_ACCOUNTS_KEY, v1Raw)
    localStorage.setItem(
      V2_KEY,
      JSON.stringify({
        state: {
          accounts: {
            'local:김학생': {
              uid: 'local:김학생',
              loginId: '김학생',
              name: '이미 있는 계정',
              unlockedIds: ['keep-me'],
              createdAt: '2026-04-01T00:00:00.000Z',
              lastLoginAt: '2026-04-02T00:00:00.000Z',
              localPasswordHash: hash,
            },
          },
          sessionKey: null,
        },
        version: 1,
      }),
    )

    const { useUserAccountStore, runV1AccountMigration } = await loadStores()
    const result = await runV1AccountMigration()
    expect(result.migrated).toEqual([])
    expect(useUserAccountStore.getState().accounts['local:김학생'].unlockedIds).toEqual(['keep-me'])
    expect(localStorage.getItem(V1_ACCOUNTS_KEY)).toBe(v1Raw)

    const withV2Password = await useUserAccountStore.getState().login('김학생', 'newpass12')
    expect(withV2Password).toEqual({ ok: true })
    const withV1Password = await useUserAccountStore.getState().login('김학생', '123456')
    expect(withV1Password).toEqual({ ok: false, error: '아이디 또는 비밀번호가 맞지 않습니다.' })
  })

  it('예전 체험 계정의 SHA-256 해시도 로그인에 그대로 통한다', async () => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mina:secret12'))
    const legacy = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    localStorage.setItem(
      V2_KEY,
      JSON.stringify({
        state: {
          accounts: {
            'local:mina': {
              uid: 'local:mina',
              loginId: 'mina',
              name: 'Mina',
              unlockedIds: [],
              createdAt: '2026-05-01T00:00:00.000Z',
              lastLoginAt: '2026-05-02T00:00:00.000Z',
              localPasswordHash: legacy,
            },
          },
          sessionKey: null,
        },
        version: 1,
      }),
    )

    const { useUserAccountStore } = await loadStores()
    const login = await useUserAccountStore.getState().login('mina', 'secret12')
    expect(login).toEqual({ ok: true })
    expect(useUserAccountStore.getState().sessionKey).toBe('local:mina')
  })
})
