import { useTypingRecordStore } from '../state/typingRecordStore'
import { useUserAccountStore } from '../state/userAccountStore'
import {
  V1_ACCOUNTS_KEY,
  copyTypingRecordsForMigratedAccounts,
  mergeV1AccountsIntoV2,
  v1KeysForMigrations,
  type MigrateV1Result,
} from './migrateV1Accounts'

/**
 * 앱 시작 시 호출. v1 원본은 남기고, v2에 없는 계정만 안전하게 옮긴다.
 * 여러 번 실행해도 같은 계정이 두 번 생기지 않는다.
 */
export async function runV1AccountMigration(): Promise<MigrateV1Result> {
  const current = useUserAccountStore.getState()
  const empty: MigrateV1Result = {
    accounts: current.accounts,
    sessionKey: current.sessionKey,
    migrated: [],
    skipped: [],
    error: null,
  }
  if (typeof localStorage === 'undefined') return empty

  const v1Raw = localStorage.getItem(V1_ACCOUNTS_KEY)
  const result = await mergeV1AccountsIntoV2(v1Raw, {
    accounts: current.accounts,
    sessionKey: current.sessionKey,
  })

  if (result.migrated.length > 0) {
    useUserAccountStore.setState({
      accounts: result.accounts,
      sessionKey: result.sessionKey,
    })
    const typings = useTypingRecordStore.getState()
    const remapped = copyTypingRecordsForMigratedAccounts(
      typings.byUser,
      v1KeysForMigrations(v1Raw, result.migrated),
    )
    const changed = Object.keys(remapped).some((key) => remapped[key] !== typings.byUser[key])
      || Object.keys(typings.byUser).length !== Object.keys(remapped).length
    if (changed) useTypingRecordStore.setState({ byUser: remapped })
  }

  return result
}
