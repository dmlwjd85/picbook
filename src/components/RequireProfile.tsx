import { Navigate, useLocation } from 'react-router-dom'
import { useUserAccountStore } from '../state/userAccountStore'

type Props = {
  children: React.ReactNode
}

/** 로그인 세션이 없으면 로그인 화면으로 */
export function RequireProfile({ children }: Props) {
  const sessionKey = useUserAccountStore((s) => s.sessionKey)
  const location = useLocation()

  if (!sessionKey) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
