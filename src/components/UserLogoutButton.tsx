import { useNavigate } from 'react-router-dom'
import { usePlaySessionStore } from '../state/playSessionStore'
import { useUserAccountStore } from '../state/userAccountStore'

type Props = {
  className?: string
}

/** 로그아웃 — 계정·서재는 유지, 홈으로 */
export function UserLogoutButton({ className }: Props) {
  const navigate = useNavigate()
  const logout = useUserAccountStore((s) => s.logout)
  const clearSession = usePlaySessionStore((s) => s.clearSession)

  return (
    <button
      type="button"
      className={
        className ??
        'rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50'
      }
      onClick={() => {
        if (!window.confirm('로그아웃할까요? 서재와 기록은 계정에 남아 있어요.')) return
        clearSession()
        void logout().then(() => navigate('/', { replace: true }))
      }}
    >
      로그아웃
    </button>
  )
}
