import { Navigate } from 'react-router-dom'
import { useUserProfileStore } from '../state/userProfileStore'

/** 루트: 프로필 유무에 따라 설정 또는 책장으로 이동 */
export default function HomePage() {
  const profile = useUserProfileStore((s) => s.profile)
  if (!profile) return <Navigate to="/setup" replace />
  return <Navigate to="/bookshelf" replace />
}
