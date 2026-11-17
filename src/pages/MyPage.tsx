import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/site/SiteHeader'
import { passLabel } from '../data/passProducts'
import { fetchMyRecords, type TypingRecord } from '../lib/typingRecords'
import { useTypingRecordStore } from '../state/typingRecordStore'
import { useUserAccountStore } from '../state/userAccountStore'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold text-stone-500">{label}</p>
      <p className="mt-1 font-display text-3xl text-stone-900">{value}</p>
    </div>
  )
}

export default function MyPage() {
  const account = useUserAccountStore((s) => s.getActiveAccount())
  const passes = useUserAccountStore((s) => s.passes)
  const localRecords = useTypingRecordStore((s) => (account ? s.byUser[account.uid] : undefined))
  const [cloud, setCloud] = useState<TypingRecord[] | null>(null)
  const uid = account?.uid

  useEffect(() => {
    if (!uid) return
    let cancelled = false
    void fetchMyRecords(uid).then((rows) => {
      if (!cancelled) setCloud(rows)
    })
    return () => {
      cancelled = true
    }
  }, [uid])

  // 다른 기기 기록(클라우드)과 이 기기 기록을 합쳐 최신순으로
  const records = useMemo(() => {
    const seen = new Set<string>()
    return [...(cloud ?? []), ...(localRecords ?? [])]
      .filter((r) => {
        const k = `${r.at}|${r.bookId}|${r.sentence}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 50)
  }, [cloud, localRecords])

  if (!account) return null

  const best = records.reduce((m, r) => Math.max(m, r.cpm), 0)
  const avgAccuracy = records.length ? Math.round(records.reduce((s, r) => s + r.accuracy, 0) / records.length) : 0

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl text-stone-900">{account.name}님의 기록</h1>
        <p className="mt-1 text-sm text-stone-500">아이디 {account.loginId}</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="최근 쓴 문장" value={`${records.length}개`} />
          <Stat label="최고 타수" value={best ? `${best}타` : '-'} />
          <Stat label="평균 정확도" value={records.length ? `${avgAccuracy}%` : '-'} />
        </div>

        <section className="mt-8">
          <h2 className="text-base font-bold text-stone-900">내 이용권</h2>
          {passes.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {passes.map((p) => (
                <li key={p} className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                  {passLabel(p)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-stone-600">
              아직 이용권이 없어요.{' '}
              <Link to="/passes" className="font-bold text-orange-700 hover:underline">
                이용권 보기
              </Link>
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-base font-bold text-stone-900">최근 기록</h2>
          {records.length === 0 ? (
            <p className="mt-2 rounded-xl bg-stone-100 px-4 py-6 text-center text-sm text-stone-500">
              아직 기록이 없어요.{' '}
              <Link to="/bookshelf" className="font-bold text-orange-700 hover:underline">
                보관함에서 책을 골라 보세요
              </Link>
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
              {records.map((r) => (
                <li key={`${r.at}-${r.sentence}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-stone-900">{r.sentence}</p>
                    <p className="text-xs text-stone-500">
                      {r.bookTitle} · {new Date(r.at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <span className="font-bold tabular-nums text-stone-900">{r.cpm}타</span>
                  <span className="w-12 text-right text-xs tabular-nums text-stone-500">{r.accuracy}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </SiteLayout>
  )
}
