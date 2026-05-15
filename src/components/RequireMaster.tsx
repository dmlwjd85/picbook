import { Navigate, useLocation } from 'react-router-dom'
import { useMasterAuthStore } from '../state/masterAuthStore'

type Props = {
  children: React.ReactNode
}

/** 마스터 비밀번호 설정·로그인 후에만 접근 */
export function RequireMaster({ children }: Props) {
  const location = useLocation()
  const masterPassword = useMasterAuthStore((s) => s.masterPassword)
  const isLoggedIn = useMasterAuthStore((s) => s.isLoggedIn)

  if (!masterPassword) {
    return <Navigate to="/master/setup" replace state={{ from: location.pathname }} />
  }

  if (!isLoggedIn) {
    return <Navigate to="/master/login" replace state={{ from: location.pathname }} />
  }

  return children
}
