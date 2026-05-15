import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { SixDigitPasswordFields } from '../components/SixDigitPasswordFields'
import { isValidSixDigitPassword } from '../lib/password'
import { useMasterAuthStore } from '../state/masterAuthStore'

export default function MasterSetupPage() {
  const navigate = useNavigate()
  const masterPassword = useMasterAuthStore((s) => s.masterPassword)
  const setMasterPassword = useMasterAuthStore((s) => s.setMasterPassword)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (masterPassword) {
    return <Navigate to="/master/login" replace />
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isValidSixDigitPassword(password)) {
      setError('마스터 비밀번호는 숫자 6자리로 입력해 주세요.')
      return
    }
    if (password !== confirm) {
      setError('비밀번호가 서로 다릅니다.')
      return
    }
    setMasterPassword(password)
    navigate('/editor', { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-slate-800 via-slate-900 to-stone-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">PicBook Master</p>
        <h1 className="mt-2 text-center text-2xl font-bold">마스터 비밀번호 설정</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          처음 한 번만 숫자 6자리를 정합니다. 이후 편집·관리 화면에 들어갈 때 사용해요.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-slate-600/50 bg-slate-800/80 p-6 shadow-xl backdrop-blur-sm"
        >
          <SixDigitPasswordFields
            password={password}
            confirm={confirm}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirm}
            passwordLabel="마스터 비밀번호 (숫자 6자리)"
            confirmLabel="마스터 비밀번호 확인"
          />

          {error ? <p className="mt-3 text-sm font-medium text-red-400">{error}</p> : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-slate-100 py-3.5 text-sm font-bold text-slate-900 shadow-md transition hover:bg-white"
          >
            설정하고 편집 화면으로
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/setup" className="text-slate-400 underline-offset-2 hover:text-slate-300 hover:underline">
            ← 일반 사용자 시작하기
          </Link>
        </p>
      </div>
    </div>
  )
}
