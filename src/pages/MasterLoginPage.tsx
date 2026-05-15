import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isValidSixDigitPassword } from '../lib/password'
import { useMasterAuthStore } from '../state/masterAuthStore'

export default function MasterLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const masterPassword = useMasterAuthStore((s) => s.masterPassword)
  const isLoggedIn = useMasterAuthStore((s) => s.isLoggedIn)
  const login = useMasterAuthStore((s) => s.login)
  const hydrateSession = useMasterAuthStore((s) => s.hydrateSession)

  useEffect(() => {
    hydrateSession()
  }, [hydrateSession])

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/editor'

  if (!masterPassword) {
    return <Navigate to="/master/setup" replace />
  }

  if (isLoggedIn) {
    return <Navigate to={from} replace />
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isValidSixDigitPassword(password)) {
      setError('숫자 6자리를 입력해 주세요.')
      return
    }
    if (!login(password)) {
      setError('비밀번호가 맞지 않습니다.')
      setPassword('')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-slate-800 via-slate-900 to-stone-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">PicBook Master</p>
        <h1 className="mt-2 text-center text-2xl font-bold">마스터 로그인</h1>
        <p className="mt-2 text-center text-sm text-slate-400">편집·관리 화면에 들어가려면 비밀번호를 입력하세요.</p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-slate-600/50 bg-slate-800/80 p-6 shadow-xl backdrop-blur-sm"
        >
          <label className="block text-sm font-medium text-slate-300">
            마스터 비밀번호
            <input
              type="password"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-center font-mono text-xl tracking-[0.35em] text-white focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="••••••"
            />
          </label>

          {error ? <p className="mt-3 text-sm font-medium text-red-400">{error}</p> : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-slate-100 py-3.5 text-sm font-bold text-slate-900 shadow-md transition hover:bg-white"
          >
            로그인
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/bookshelf" className="text-slate-400 underline-offset-2 hover:text-slate-300 hover:underline">
            ← 책장으로
          </Link>
        </p>
      </div>
    </div>
  )
}
