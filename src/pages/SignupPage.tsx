import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { SiteLayout } from '../components/site/SiteHeader'
import { LOGIN_ID_HINT, NICKNAME_HINT, PASSWORD_HINT } from '../lib/accountRules'
import { useUserAccountStore } from '../state/userAccountStore'
import { LocalModeNotice, fieldClass } from './LoginPage'

export default function SignupPage() {
  const navigate = useNavigate()
  const sessionKey = useUserAccountStore((s) => s.sessionKey)
  const register = useUserAccountStore((s) => s.register)

  const [loginId, setLoginId] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (sessionKey) return <Navigate to="/bookshelf" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('비밀번호가 서로 달라요. 다시 확인해 주세요.')
      return
    }
    if (!agreed) {
      setError('아래 안내를 읽고 동의에 표시해 주세요.')
      return
    }
    setLoading(true)
    void register(loginId, nickname, password).then((result) => {
      setLoading(false)
      if (!result.ok) setError(result.error)
      else navigate('/bookshelf', { replace: true })
    })
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-12">
        <h1 className="font-display text-3xl text-stone-900">회원가입</h1>
        <p className="mt-2 text-sm text-stone-600">가입하면 무료 픽북과 내 기록, 랭킹을 이용할 수 있어요.</p>
        <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-stone-700">
            아이디 <span className="font-normal text-stone-500">· {LOGIN_ID_HINT}</span>
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={16}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-stone-700">
            닉네임 <span className="font-normal text-stone-500">· {NICKNAME_HINT}</span>
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={10} className={fieldClass} />
          </label>
          <label className="mt-4 block text-sm font-semibold text-stone-700">
            비밀번호 <span className="font-normal text-stone-500">· {PASSWORD_HINT}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-stone-700">
            비밀번호 확인
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={fieldClass}
            />
          </label>

          <div className="mt-5 rounded-xl bg-stone-50 p-4 text-xs leading-relaxed text-stone-600">
            <p className="font-bold text-stone-800">PicBook이 저장하는 정보</p>
            <p className="mt-1">아이디, 닉네임, 타자 기록(타수·정확도), 보유 이용권. 이름·전화번호·이메일은 받지 않아요.</p>
            <p className="mt-1">비밀번호를 잊으면 되찾을 수 없으니 꼭 기억해 주세요.</p>
            <label className="mt-3 flex items-start gap-2 text-sm font-semibold text-stone-800">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              <span>위 내용에 동의해요. 만 14세 미만이면 보호자나 선생님께 허락을 받았어요.</span>
            </label>
          </div>

          {error ? (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-orange-600 py-3.5 text-base font-bold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? '만드는 중…' : '가입하기'}
          </button>
        </form>
        <LocalModeNotice />
        <p className="mt-6 text-center text-sm text-stone-600">
          이미 계정이 있나요?{' '}
          <Link to="/login" className="font-bold text-orange-700 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </SiteLayout>
  )
}
