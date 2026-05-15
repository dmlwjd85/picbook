import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { SixDigitPasswordFields } from '../components/SixDigitPasswordFields'
import { isValidSixDigitPassword } from '../lib/password'
import { useUserProfileStore } from '../state/userProfileStore'

export default function SetupPage() {
  const navigate = useNavigate()
  const profile = useUserProfileStore((s) => s.profile)
  const setProfile = useUserProfileStore((s) => s.setProfile)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (profile) {
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
    setProfile(trimmed, password)
    navigate('/bookshelf', { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-amber-100 via-amber-50 to-stone-100 px-4 py-12">
      <div className="w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/70">PicBook</p>
        <h1 className="mt-2 text-center text-2xl font-bold text-stone-900">처음 오신 걸 환영해요</h1>
        <p className="mt-2 text-center text-sm text-stone-600">
          이름과 6자리 비밀번호를 정하면, 책장에서 픽북을 고를 수 있어요.
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
              placeholder="예: 민수"
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
            className="mt-6 w-full rounded-xl bg-amber-800 py-3.5 text-sm font-bold text-amber-50 shadow-md transition hover:bg-amber-900"
          >
            책장으로 가기
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500">
          <Link
            to="/master/login"
            className="text-stone-600 underline-offset-2 hover:text-stone-800 hover:underline"
          >
            마스터 로그인 (편집·관리)
          </Link>
        </p>
      </div>
    </div>
  )
}
