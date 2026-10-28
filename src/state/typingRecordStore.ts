import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PERSIST_V1, migratePassthrough } from './persistVersion'
import { saveRecordToCloud, type TypingRecord } from '../lib/typingRecords'
import { useUserAccountStore } from './userAccountStore'

const KEEP = 50

type TypingRecordStore = {
  /** 계정(uid)별 최근 기록 — 최신이 앞 */
  byUser: Record<string, TypingRecord[]>
  /** 로그인한 회원의 기록만 남긴다(체험은 기록하지 않음) */
  addRecord: (record: Omit<TypingRecord, 'at'>) => void
}

export const useTypingRecordStore = create<TypingRecordStore>()(
  persist(
    (set) => ({
      byUser: {},
      addRecord: (input) => {
        const account = useUserAccountStore.getState().getActiveAccount()
        if (!account) return
        const record: TypingRecord = { ...input, at: new Date().toISOString() }
        set((s) => ({
          byUser: {
            ...s.byUser,
            [account.uid]: [record, ...(s.byUser[account.uid] ?? [])].slice(0, KEEP),
          },
        }))
        void saveRecordToCloud(account.uid, account.name, record)
      },
    }),
    { name: 'picbook.typing-records.v1', version: PERSIST_V1, migrate: migratePassthrough },
  ),
)
