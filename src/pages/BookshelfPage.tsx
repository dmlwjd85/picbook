import { Link, useNavigate } from 'react-router-dom'
import { MagazineShelf } from '../components/bookshelf/MagazineShelf'
import { SiteHeader } from '../components/site/SiteHeader'
import { useStaffPreview } from '../lib/bookAccess'
import { useUserAccountStore } from '../state/userAccountStore'

/** 내 보관함 — 이용권으로 열린 책과 무료 책 */
export default function BookshelfPage() {
  const navigate = useNavigate()
  const profileName = useUserAccountStore((s) => s.getActiveAccount()?.name)
  const staff = useStaffPreview()

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <div className="relative flex-1 bg-gradient-to-b from-amber-950 via-stone-950 to-stone-950 text-amber-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,200,120,0.1),_transparent_50%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl">{profileName ? `${profileName}님의 보관함` : '보관함'}</h1>
              <p className="mt-1 text-sm text-amber-200/75">
                {staff ? '관리자 미리보기 — 모든 픽북을 열어볼 수 있어요' : '이용권으로 열린 픽북과 무료 픽북이 모여 있어요'}
              </p>
            </div>
            <Link
              to="/passes"
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-orange-500"
            >
              이용권으로 더 열기
            </Link>
          </div>
          <div className="mt-6">
            <MagazineShelf onOpenBook={(id) => navigate(`/play/${id}`)} onGoStore={() => navigate('/passes')} />
          </div>
        </div>
      </div>
    </div>
  )
}
