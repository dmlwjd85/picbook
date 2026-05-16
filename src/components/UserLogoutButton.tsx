import { useNavigate } from 'react-router-dom'
import { usePlaySessionStore } from '../state/playSessionStore'
import { useUserAccountStore } from '../state/userAccountStore'

type Props = {
  className?: string
}

/** 로그아웃 — 계정·구매 이력은 유지, 로그인 화면으로 */
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
        if (!window.confirm('로그아웃하면 다시 이름·비밀번호로 로그인해야 합니다. 구매한 PicBook은 계정에 남습니다.')) return
        logout()
        clearSession()
        navigate('/login', { replace: true })
      }}
    >
      로그아웃
    </button>
  )
}
