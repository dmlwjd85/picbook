import { Navigate, useLocation } from 'react-router-dom'
import { useMasterAuthStore } from '../state/masterAuthStore'
import { useUserAccountStore } from '../state/userAccountStore'

type Props = {
  children: React.ReactNode
}

/** 사용자 로그인 또는 마스터 로그인 중 하나면 접근 */
export function RequireUserOrMaster({ children }: Props) {
  const location = useLocation()
  const sessionKey = useUserAccountStore((s) => s.sessionKey)
  const masterLoggedIn = useMasterAuthStore((s) => s.isLoggedIn)

  if (!sessionKey && !masterLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
