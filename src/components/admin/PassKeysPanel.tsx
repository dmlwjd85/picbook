import { useEffect, useState } from 'react'
import { PASS_PRODUCTS, passLabel, type PassId } from '../../data/passProducts'
import { createPassKey, listPassKeys, type PassKeyDoc } from '../../lib/passes'

/** (관리자) 이용권 코드 발급·사용 현황 — 학교·학급 단위 판매나 결제 연동 전 수동 지급에 쓴다 */
export function PassKeysPanel() {
  const [keys, setKeys] = useState<(PassKeyDoc & { key: string })[]>([])
  const [category, setCategory] = useState<PassId>(PASS_PRODUCTS[0].id)
  const [maxUses, setMaxUses] = useState(1)
  const [memo, setMemo] = useState('')
  const [issued, setIssued] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = () => void listPassKeys().then(setKeys)
  useEffect(reload, [])

  const issue = async () => {
    setBusy(true)
    setError(null)
    const key = await createPassKey(category, maxUses, memo)
    setBusy(false)
    if (!key) {
      setError('발급하지 못했어요. 관리자 계정으로 로그인했는지 확인해 주세요.')
      return
    }
    setIssued(key)
    setMemo('')
    reload()
  }

  const input = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900'
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">이용권 코드</h2>
      <p className="mt-1 text-xs text-slate-600">
        코드를 받은 회원이 「이용권」 화면에 입력하면 그 분류가 열립니다. 사용 횟수를 30으로 하면 한 학급이 같은 코드를 쓸 수 있어요.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_7rem_1fr_auto] sm:items-end">
        <label className="text-xs font-semibold text-slate-700">
          이용권
          <select className={input} value={category} onChange={(e) => setCategory(e.target.value as PassId)}>
            {PASS_PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          사용 횟수
          <input type="number" min={1} max={1000} className={input} value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value) || 1)} />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          메모 (예: ○○초 6-2)
          <input className={input} value={memo} onChange={(e) => setMemo(e.target.value)} />
        </label>
        <button type="button" disabled={busy} onClick={() => void issue()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          {busy ? '발급 중…' : '코드 발급'}
        </button>
      </div>
      {issued ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          새 코드: <code className="select-all font-mono font-bold">{issued}</code>
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
      {keys.length > 0 ? (
        <ul className="mt-3 max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 text-xs">
          {keys.map((k) => (
            <li key={k.key} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-2">
              <code className="select-all font-mono text-slate-900">{k.key.replace(/^(PB)(.{4})(.{4})(.{4})(.{4})$/, '$1-$2-$3-$4-$5')}</code>
              <span className="font-semibold text-slate-700">{passLabel(k.category)}</span>
              <span className={k.uses >= k.maxUses ? 'text-slate-400' : 'text-emerald-700'}>
                {k.uses}/{k.maxUses}회 사용
              </span>
              {k.memo ? <span className="text-slate-500">{k.memo}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
