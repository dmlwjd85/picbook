import { Link, Navigate, useLocation } from 'react-router-dom'
import { isFirebaseEnabled } from '../lib/firebase'
import { useMasterAuthStore } from '../state/masterAuthStore'
import { useUserAccountStore } from '../state/userAccountStore'

/** 편집 화면에 들어갈 수 있는지 — 관리자 계정이거나(권장), 이 기기에서 마스터 로그인한 경우 */
export function useCanEdit(): boolean {
  const isAdmin = useUserAccountStore((s) => s.isAdmin)
  const masterLoggedIn = useMasterAuthStore((s) => s.isLoggedIn)
  return isAdmin || masterLoggedIn
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const canEdit = useCanEdit()
  const sessionKey = useUserAccountStore((s) => s.sessionKey)

  if (canEdit) return children
  if (!sessionKey && isFirebaseEnabled()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="text-xl font-bold text-slate-900">관리자만 들어올 수 있어요</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {isFirebaseEnabled()
            ? '이 계정은 관리자로 등록되어 있지 않습니다. Firebase 콘솔의 admins 컬렉션에 계정을 등록한 뒤 다시 로그인해 주세요.'
            : 'Firebase가 연결되지 않은 체험 모드입니다. 마스터 로그인으로 들어와 주세요.'}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            홈으로
          </Link>
          <Link to="/master/login" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            마스터 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
