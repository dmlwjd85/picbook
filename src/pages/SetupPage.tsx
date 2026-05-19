import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { SixDigitPasswordFields } from '../components/SixDigitPasswordFields'
import { isCloudSyncEnabled, isFirebaseSyncEnabled } from '../lib/accountCloudSync'
import { isValidSixDigitPassword } from '../lib/password'
import { useUserAccountStore } from '../state/userAccountStore'

export default function SetupPage() {
  const navigate = useNavigate()
  const sessionKey = useUserAccountStore((s) => s.sessionKey)
  const register = useUserAccountStore((s) => s.register)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (sessionKey) {
    return <Navigate to="/bookshelf" replace />
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = name.trim()
    if (trimmed.length < 1) {
      setError('이름을 입력해 주세요.')
      return
    }
    if (!isValidSixDigitPassword(password)) {
      setError('비밀번호는 숫자 6자리로 입력해 주세요.')
      return
    }
    if (password !== confirm) {
      setError('비밀번호가 서로 다릅니다. 다시 확인해 주세요.')
      return
    }
    setLoading(true)
    void register(trimmed, password).then((result) => {
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      navigate('/bookshelf', { replace: true })
    })
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-amber-100 via-amber-50 to-stone-100 px-4 py-12">
      <div className="w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/70">PicBook</p>
        <h1 className="mt-2 text-center text-2xl font-bold text-stone-900">처음 오신 걸 환영해요</h1>
        <p className="mt-2 text-center text-sm text-stone-600">
          이름과 6자리 비밀번호를 등록하면, 다시 로그인할 때 구매한 PicBook이 유지됩니다.
          {isFirebaseSyncEnabled()
            ? ' Firebase에 PicBook 전용으로 저장되어 다른 기기에서도 이어집니다.'
            : isCloudSyncEnabled()
              ? ' 다른 기기에서도 같은 이름·비밀번호로 이어집니다.'
              : ''}
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-amber-200/80 bg-white/90 p-6 shadow-lg shadow-amber-900/10 backdrop-blur-sm"
        >
          <label className="block text-sm font-medium text-stone-700">
            이름
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoComplete="nickname"
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="예: 정의정"
            />
          </label>

          <SixDigitPasswordFields
            password={password}
            confirm={confirm}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirm}
          />

          {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-amber-800 py-3.5 text-sm font-bold text-amber-50 shadow-md transition hover:bg-amber-900 disabled:opacity-60"
          >
            {loading ? '저장 중…' : '등록하고 책장으로'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500">
          이미 등록하셨나요?{' '}
          <Link to="/login" className="font-semibold text-amber-900 underline-offset-2 hover:underline">
            로그인
          </Link>
          <span className="mx-2 text-stone-300">·</span>
          <Link
            to="/master/login"
            className="text-stone-600 underline-offset-2 hover:text-stone-800 hover:underline"
          >
            마스터
          </Link>
        </p>
      </div>
    </div>
  )
}
