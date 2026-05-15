import { Navigate, useLocation } from 'react-router-dom'
import { useUserProfileStore } from '../state/userProfileStore'

type Props = {
  children: React.ReactNode
}

/** 프로필이 없으면 설정 화면으로 보냄 */
export function RequireProfile({ children }: Props) {
  const profile = useUserProfileStore((s) => s.profile)
  const location = useLocation()

  if (!profile) {
    return <Navigate to="/setup" replace state={{ from: location.pathname }} />
  }

  return children
}
