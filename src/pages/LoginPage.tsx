import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SiteLayout } from '../components/site/SiteHeader'
import { isFirebaseEnabled } from '../lib/firebase'
import { useUserAccountStore } from '../state/userAccountStore'

export const fieldClass =
  'mt-1.5 w-full rounded-xl border border-stone-300 px-4 py-3 text-base text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200'

export function LocalModeNotice() {
  if (isFirebaseEnabled()) return null
  return (
    <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
      지금은 체험 모드예요. 계정이 이 기기에만 저장되고, 다른 기기에서는 로그인할 수 없어요.
    </p>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/bookshelf'
  const sessionKey = useUserAccountStore((s) => s.sessionKey)
  const login = useUserAccountStore((s) => s.login)

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (sessionKey) return <Navigate to={from} replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    void login(loginId, password).then((result) => {
      setLoading(false)
      if (!result.ok) setError(result.error)
      else navigate(from, { replace: true })
    })
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <h1 className="font-display text-3xl text-stone-900">로그인</h1>
        <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-stone-700">
            아이디
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-stone-700">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={fieldClass}
            />
          </label>
          {error ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-orange-600 py-3.5 text-base font-bold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? '확인하는 중…' : '로그인'}
          </button>
        </form>
        <LocalModeNotice />
        <p className="mt-6 text-center text-sm text-stone-600">
          처음이신가요?{' '}
          <Link to="/signup" className="font-bold text-orange-700 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </SiteLayout>
  )
}
