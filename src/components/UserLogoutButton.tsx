import { useNavigate } from 'react-router-dom'
import { usePlaySessionStore } from '../state/playSessionStore'
import { useUserProfileStore } from '../state/userProfileStore'

type Props = {
  className?: string
}

/** 일반 사용자 로그아웃 — 프로필 삭제 후 처음 설정 화면으로 */
export function UserLogoutButton({ className }: Props) {
  const navigate = useNavigate()
  const clearProfile = useUserProfileStore((s) => s.clearProfile)
  const clearSession = usePlaySessionStore((s) => s.clearSession)

  return (
    <button
      type="button"
      className={
        className ??
        'rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50'
      }
      onClick={() => {
        if (!window.confirm('로그아웃하면 이름·비밀번호를 다시 설정해야 합니다. 계속할까요?')) return
        clearProfile()
        clearSession()
        navigate('/setup', { replace: true })
      }}
    >
      로그아웃
    </button>
  )
}
