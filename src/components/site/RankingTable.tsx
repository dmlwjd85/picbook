import { useEffect, useState } from 'react'
import { isFirebaseEnabled } from '../../lib/firebase'
import { fetchRanking, type RankingEntry } from '../../lib/typingRecords'
import { useUserAccountStore } from '../../state/userAccountStore'

/** 책 한 권의 타자 랭킹 */
export function RankingTable({ bookId, top = 20 }: { bookId: string; top?: number }) {
  const myUid = useUserAccountStore((s) => s.sessionKey)
  const [state, setState] = useState<{ bookId: string; rows: RankingEntry[] | null } | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchRanking(bookId, top).then((rows) => {
      if (!cancelled) setState({ bookId, rows })
    })
    return () => {
      cancelled = true
    }
  }, [bookId, top])

  if (!isFirebaseEnabled()) {
    return <p className="rounded-xl bg-stone-100 px-4 py-6 text-center text-sm text-stone-500">체험 모드에서는 랭킹이 모이지 않아요.</p>
  }
  if (!state || state.bookId !== bookId) {
    return <p className="px-4 py-6 text-center text-sm text-stone-500">불러오는 중…</p>
  }
  if (state.rows == null) {
    return <p className="rounded-xl bg-red-50 px-4 py-6 text-center text-sm text-red-700">랭킹을 불러오지 못했어요. 잠시 후 다시 열어 주세요.</p>
  }
  if (state.rows.length === 0) {
    return <p className="rounded-xl bg-stone-100 px-4 py-6 text-center text-sm text-stone-500">아직 기록이 없어요. 첫 번째 주인공이 되어 보세요!</p>
  }
  return (
    <ol className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
      {state.rows.map((r, i) => (
        <li
          key={r.uid}
          className={`flex items-center gap-3 px-4 py-2.5 text-sm ${r.uid === myUid ? 'bg-orange-50' : ''}`}
        >
          <span
            className={`w-7 text-center font-display text-lg ${i < 3 ? 'text-orange-600' : 'text-stone-400'}`}
          >
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 truncate font-semibold text-stone-900">
            {r.nickname}
            {r.uid === myUid ? <span className="ml-1.5 text-xs font-bold text-orange-700">나</span> : null}
          </span>
          <span className="font-bold tabular-nums text-stone-900">{r.bestCpm}타</span>
          <span className="w-12 text-right text-xs tabular-nums text-stone-500">{r.accuracy}%</span>
        </li>
      ))}
    </ol>
  )
}
