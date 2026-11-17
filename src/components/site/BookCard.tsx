import { Link } from 'react-router-dom'
import type { PicbookCatalogItem } from '../../data/picbookCatalog'
import { categoryLabel } from '../../data/picbookCategories'

/** 책 한 권 카드 — 열 수 있으면 "읽기", 아니면 "체험하기" */
export function BookCard({ book, open }: { book: PicbookCatalogItem; open: boolean }) {
  return (
    <Link
      to={`/play/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[3/2] bg-stone-200">
        <img src={book.coverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-bold text-stone-800">
          {categoryLabel(book.category, book.grade, book.subject)}
        </span>
        {book.free ? (
          <span className="absolute right-2 top-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
            무료
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-base font-bold text-stone-900">{book.title}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-600">{book.blurb}</p>
        <span
          className={`mt-3 inline-flex w-fit rounded-lg px-3 py-1.5 text-xs font-bold ${
            open ? 'bg-orange-600 text-white' : 'border border-orange-600 text-orange-700'
          }`}
        >
          {open ? '읽기 →' : '체험하기 →'}
        </span>
      </div>
    </Link>
  )
}
