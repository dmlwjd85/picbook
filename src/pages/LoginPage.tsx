import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { TypingDemoShowcase } from '../components/TypingDemoShowcase'
import { isCloudSyncEnabled, isFirebaseSyncEnabled } from '../lib/accountCloudSync'
import { isValidSixDigitPassword } from '../lib/password'
import { useUserAccountStore } from '../state/userAccountStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const sessionKey = useUserAccountStore((s) => s.sessionKey)
  const login = useUserAccountStore((s) => s.login)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (sessionKey) {
    return <Navigate to="/bookshelf" replace />
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isValidSixDigitPassword(password)) {
      setError('비밀번호는 숫자 6자리로 입력해 주세요.')
      return
    }
    setLoading(true)
    void login(name, password).then((result) => {
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate('/bookshelf', { replace: true })
    })
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-amber-100 via-amber-50 to-stone-100 px-4 py-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="order-2 lg:order-1">
          <TypingDemoShowcase className="w-full" />
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/70 lg:text-left">
            PicBook
          </p>
          <h1 className="mt-2 text-center text-2xl font-bold text-stone-900 lg:text-left">다시 오신 것을 환영해요</h1>
          <p className="mt-2 text-center text-sm text-stone-600 lg:text-left">
            이름과 비밀번호로 로그인하면 구매한 PicBook·서재가 그대로 이어집니다.
            {isFirebaseSyncEnabled() ? (
              <span className="mt-1 block text-xs text-emerald-800">
                Firebase에 PicBook 회원 정보가 저장되어, 다른 기기·태블릿에서도 같은 이름으로 로그인하면 이어집니다.
              </span>
            ) : isCloudSyncEnabled() ? (
              <span className="mt-1 block text-xs text-emerald-800">
                다른 기기·태블릿에서도 같은 이름으로 로그인하면 연동됩니다.
              </span>
            ) : null}
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-6 rounded-2xl border border-amber-200/80 bg-white/90 p-6 shadow-lg shadow-amber-900/10 backdrop-blur-sm"
          >
            <label className="block text-sm font-medium text-stone-700">
              이름
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                autoComplete="username"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="예: 정의정"
              />
            </label>

            <div className="mt-4">
              <p className="text-sm font-medium text-stone-700">비밀번호 (6자리)</p>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-center font-mono text-xl tracking-[0.35em] text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="••••••"
              />
            </div>

            {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-amber-800 py-3.5 text-sm font-bold text-amber-50 shadow-md transition hover:bg-amber-900 disabled:opacity-60"
            >
              {loading ? '불러오는 중…' : '로그인'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500 lg:text-left">
            처음이신가요?{' '}
            <Link to="/setup" className="font-semibold text-amber-900 underline-offset-2 hover:underline">
              이름 등록하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
