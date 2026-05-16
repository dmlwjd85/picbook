import { Navigate } from 'react-router-dom'
import { useUserAccountStore } from '../state/userAccountStore'

/** 루트: 로그인 세션 있으면 책장, 없으면 로그인 */
export default function HomePage() {
  const sessionKey = useUserAccountStore((s) => s.sessionKey)
  if (!sessionKey) return <Navigate to="/login" replace />
  return <Navigate to="/bookshelf" replace />
}
