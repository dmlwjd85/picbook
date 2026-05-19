import { getUnlockedCatalogItems } from '../../data/picbookCatalog'
import { useShelfBookIds } from '../../lib/bookAccess'
import { MagazineCover } from './MagazineCover'

type Props = {
  onOpenBook: (bookId: string) => void
  onGoStore: () => void
}

/** 개인 서재 — 매거진이 딱 맞게 진열된 선반 */
export function MagazineShelf({ onOpenBook, onGoStore }: Props) {
  const shelfIds = useShelfBookIds()
  const books = getUnlockedCatalogItems(shelfIds)

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-amber-50">내 서재</h2>
          <p className="mt-0.5 text-xs text-amber-200/70">구매·등록한 PicBook이 매거진처럼 진열됩니다</p>
        </div>
        {books.length > 0 ? (
          <span className="rounded-full bg-amber-800/50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-100">
            {books.length}권
          </span>
        ) : null}
      </div>

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-700/50 bg-amber-950/30 px-6 py-14 text-center">
          <p className="text-sm font-medium text-amber-100">아직 서재가 비어 있어요</p>
          <p className="mt-2 text-xs leading-relaxed text-amber-300/80">
            「픽북 구매하기」에서 제품키를 입력하면
            <br />
            여기에 매거진이 진열됩니다.
          </p>
          <button
            type="button"
            onClick={onGoStore}
            className="mt-5 rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-bold text-amber-50 shadow-md hover:bg-amber-600"
          >
            픽북 구매하기
          </button>
        </div>
      ) : (
        <div className="relative rounded-xl border border-amber-800/40 bg-gradient-to-b from-amber-950/90 to-stone-950/90 px-4 pb-5 pt-6 shadow-inner sm:px-6">
          <div
            className="flex flex-wrap items-end justify-center gap-x-5 gap-y-8 sm:gap-x-6"
            style={{ perspective: '900px' }}
          >
            {books.map((book, i) => (
              <div
                key={book.id}
                className="origin-bottom"
                style={{
                  transform: `rotateY(${((i % 3) - 1) * 2}deg)`,
                }}
              >
                <MagazineCover book={book} onOpen={() => onOpenBook(book.id)} size="lg" />
              </div>
            ))}
          </div>
          {/* 선반 판 */}
          <div
            className="mt-6 h-3 rounded-sm bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
            aria-hidden
          />
          <div className="mx-auto mt-1 h-1 max-w-[92%] rounded-full bg-amber-700/30" aria-hidden />
        </div>
      )}
    </section>
  )
}
