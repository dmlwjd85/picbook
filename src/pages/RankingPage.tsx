import { useMemo, useState } from 'react'
import { RankingTable } from '../components/site/RankingTable'
import { SiteLayout } from '../components/site/SiteHeader'
import { getEditableCatalogItems } from '../data/picbookCatalog'
import { categoryLabel } from '../data/picbookCategories'
import { RANKING_MIN_ACCURACY } from '../lib/typingRecords'
import { useCustomPicbookStore } from '../state/customPicbookStore'

export default function RankingPage() {
  const customBooks = useCustomPicbookStore((s) => s.books)
  const books = useMemo(() => getEditableCatalogItems(), [customBooks])
  const [bookId, setBookId] = useState(books[0]?.id ?? '')

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl text-stone-900">랭킹</h1>
        <p className="mt-2 text-sm text-stone-600">
          책마다 한 문장에서 낸 가장 빠른 타수로 겨뤄요. 정확도 {RANKING_MIN_ACCURACY}% 이상인 기록만 올라갑니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {books.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBookId(b.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${
                bookId === b.id ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'
              }`}
            >
              {b.title}
              <span className="ml-1.5 text-xs font-medium opacity-70">{categoryLabel(b.category, b.grade, b.subject)}</span>
            </button>
          ))}
        </div>
        <div className="mt-5">{bookId ? <RankingTable bookId={bookId} /> : null}</div>
      </div>
    </SiteLayout>
  )
}
