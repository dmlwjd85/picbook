import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SiteLayout } from '../components/site/SiteHeader'
import { PASS_ALL, PASS_PRODUCTS, passLabel } from '../data/passProducts'
import { getEditableCatalogItems } from '../data/picbookCatalog'
import { useCustomPicbookStore } from '../state/customPicbookStore'
import { useUserAccountStore } from '../state/userAccountStore'

export default function PassesPage() {
  const loggedIn = useUserAccountStore((s) => Boolean(s.sessionKey))
  const passes = useUserAccountStore((s) => s.passes)
  const redeemPass = useUserAccountStore((s) => s.redeemPass)
  const customBooks = useCustomPicbookStore((s) => s.books)
  const books = useMemo(() => getEditableCatalogItems(), [customBooks])

  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const hasAll = passes.includes(PASS_ALL)

  const onRedeem = (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setBusy(true)
    void redeemPass(code).then((r) => {
      setBusy(false)
      if (r.ok) {
        setCode('')
        setMessage({ ok: true, text: `${passLabel(r.pass)}이 등록됐어요. 내 보관함에서 바로 읽을 수 있어요.` })
      } else setMessage({ ok: false, text: r.error })
    })
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl text-stone-900">이용권</h1>
        <p className="mt-2 text-sm text-stone-600">
          분류별 이용권이 있으면 그 분류의 픽북이 모두 내 보관함에 열려요. 새로 나오는 책도 함께 열립니다.
        </p>

        {!loggedIn ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-stone-800">이용권은 회원가입 후 등록할 수 있어요. 무료 픽북은 가입만 해도 열려요.</p>
            <div className="flex gap-2">
              <Link to="/signup" className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
                회원가입
              </Link>
              <Link to="/login" state={{ from: '/passes' }} className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800">
                로그인
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onRedeem} className="mt-5 rounded-2xl border border-stone-200 bg-white p-4">
            <label className="block text-sm font-bold text-stone-800" htmlFor="pass-code">
              이용권 코드 등록
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                id="pass-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PB-XXXX-XXXX-XXXX-XXXX"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-2.5 font-mono text-sm uppercase text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                type="submit"
                disabled={busy || !code.trim()}
                className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-stone-700 disabled:opacity-40"
              >
                {busy ? '확인하는 중…' : '등록'}
              </button>
            </div>
            {message ? (
              <p role="status" className={`mt-2 text-sm font-semibold ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>
                {message.text}
              </p>
            ) : null}
          </form>
        )}

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {PASS_PRODUCTS.map((p) => {
            const included = p.id === PASS_ALL ? books : books.filter((b) => b.category === p.id)
            const owned = hasAll || passes.includes(p.id)
            return (
              <li key={p.id} className={`flex flex-col rounded-2xl border bg-white p-5 ${owned ? 'border-emerald-400' : 'border-stone-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">{p.label}</h2>
                    <p className="mt-0.5 text-sm text-stone-600">{p.description}</p>
                  </div>
                  <p className="shrink-0 text-right text-base font-bold text-stone-900">{p.priceLabel ?? '가격 준비 중'}</p>
                </div>
                <div className="mt-3 flex min-h-[3.5rem] flex-1 flex-wrap content-start gap-1.5">
                  {included.length === 0 ? (
                    <p className="text-xs text-stone-500">곧 책이 추가됩니다.</p>
                  ) : (
                    included.slice(0, 6).map((b) => (
                      <Link key={b.id} to={`/play/${b.id}`} title={`${b.title} ${owned ? '읽기' : '체험하기'}`}>
                        <img src={b.coverImage} alt={b.title} loading="lazy" className="h-12 w-[4.5rem] rounded-md object-cover ring-1 ring-stone-200" />
                      </Link>
                    ))
                  )}
                  {included.length > 6 ? <span className="self-center text-xs font-semibold text-stone-500">외 {included.length - 6}권</span> : null}
                </div>
                {owned ? (
                  <p className="mt-4 rounded-xl bg-emerald-50 py-2.5 text-center text-sm font-bold text-emerald-800">이용 중</p>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-4 rounded-xl bg-stone-200 py-2.5 text-sm font-bold text-stone-500"
                    title="카드 결제는 준비 중입니다. 이용권 코드로 등록할 수 있어요."
                  >
                    카드 결제 준비 중 · 코드로 등록할 수 있어요
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </SiteLayout>
  )
}
