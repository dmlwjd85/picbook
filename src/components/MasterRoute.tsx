import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '../store/useUiStore'

export function MasterRoute({ children }: { children: ReactNode }) {
  const role = useUiStore((s) => s.role)
  const googleUser = useUiStore((s) => s.googleUser)
  const navigate = useNavigate()
  const canCreate = role === 'master' || Boolean(googleUser)

  useEffect(() => {
    if (!canCreate) {
      // 생성/편집 툴킷은 마스터만 접근
      navigate('/store', { replace: true })
    }
  }, [canCreate, navigate])

  if (!canCreate) {
    return <div className="h-full flex items-center justify-center text-sm text-slate-600">접근 권한 확인 중…</div>
  }

  return <>{children}</>
}
