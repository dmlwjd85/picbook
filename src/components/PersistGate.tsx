import { useEffect, useState, type ReactNode } from 'react'
import { useMasterAuthStore } from '../state/masterAuthStore'
import { useUserAccountStore } from '../state/userAccountStore'

type PersistStore = {
  persist: {
    hasHydrated: () => boolean
    onFinishHydration: (fn: () => void) => () => void
  }
}

function waitForHydration(store: PersistStore): Promise<void> {
  return new Promise((resolve) => {
    if (store.persist.hasHydrated()) {
      resolve()
      return
    }
    const unsub = store.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })
}

/** localStorage 복원 전에 로그인 화면으로 튕기지 않도록 대기 */
export function PersistGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const migrateLegacyStorage = useUserAccountStore((s) => s.migrateLegacyStorage)

  useEffect(() => {
    let cancelled = false
    void Promise.all([
      waitForHydration(useUserAccountStore),
      waitForHydration(useMasterAuthStore),
    ]).then(() => {
      migrateLegacyStorage()
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [migrateLegacyStorage])

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-stone-100 text-sm text-stone-600">
        불러오는 중…
      </div>
    )
  }

  return children
}
