import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCard } from '../components/site/BookCard'
import { RankingTable } from '../components/site/RankingTable'
import { SiteLayout } from '../components/site/SiteHeader'
import { TypingDemoShowcase } from '../components/TypingDemoShowcase'
import { TRIAL_SENTENCE_COUNT } from '../data/passProducts'
import { getEditableCatalogItems } from '../data/picbookCatalog'
import { PICBOOK_CATEGORIES, type PicbookCategoryId } from '../data/picbookCategories'
import { canOpenBook, useAccessContext } from '../lib/bookAccess'
import { useCustomPicbookStore } from '../state/customPicbookStore'
import { useUserAccountStore } from '../state/userAccountStore'

const STEPS = [
  { n: '1', title: '문장을 따라 써요', body: '화면에 나온 문장을 키보드로 그대로 따라 씁니다.' },
  { n: '2', title: '그림이 바뀌어요', body: '쓰는 만큼 장면이 차례로 나타나 이야기가 이어집니다.' },
  { n: '3', title: '기록이 쌓여요', body: '타수와 정확도가 남고, 책마다 랭킹에 도전할 수 있어요.' },
]

export default function HomePage() {
  const account = useUserAccountStore((s) => s.getActiveAccount())
  const access = useAccessContext()
  const customBooks = useCustomPicbookStore((s) => s.books)
  const books = useMemo(() => getEditableCatalogItems(), [customBooks])
  const [category, setCategory] = useState<PicbookCategoryId | 'all'>('all')

  const categories = PICBOOK_CATEGORIES.filter((c) => books.some((b) => b.category === c.id))
  const shown = books.filter((b) => category === 'all' || b.category === category)
  const trialBook = books[0]
  const rankingBook = books.find((b) => b.category === 'proverb') ?? books[0]

  return (
    <SiteLayout>
      {/* 첫 화면 */}
      <section className="border-b border-stone-200 bg-gradient-to-b from-orange-50 to-stone-50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-14">
          <div>
            <h1 className="font-display text-4xl leading-tight text-stone-900 sm:text-5xl">
              따라 쓰면
              <br />
              <span className="text-orange-600">그림책</span>이 완성돼요
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-stone-600">
              동화·교과·속담·명언을 타자로 따라 쓰며 읽는 PicBook. 가입하지 않아도 책마다 앞의 {TRIAL_SENTENCE_COUNT}문장을 바로 써 볼 수 있어요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {account ? (
                <Link to="/bookshelf" className="rounded-xl bg-orange-600 px-6 py-3 text-base font-bold text-white shadow hover:bg-orange-700">
                  내 보관함 열기
                </Link>
              ) : trialBook ? (
                <Link to={`/play/${trialBook.id}`} className="rounded-xl bg-orange-600 px-6 py-3 text-base font-bold text-white shadow hover:bg-orange-700">
                  바로 체험하기
                </Link>
              ) : null}
              {account ? (
                <Link to="/passes" className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-base font-bold text-stone-800 hover:bg-stone-50">
                  이용권 보기
                </Link>
              ) : (
                <Link to="/signup" className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-base font-bold text-stone-800 hover:bg-stone-50">
                  회원가입
                </Link>
              )}
            </div>
          </div>
          <TypingDemoShowcase className="w-full" />
        </div>
      </section>

      {/* 연습 방법 */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl text-stone-900">이렇게 연습해요</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-stone-200 bg-white p-5">
              <span className="font-display text-3xl text-orange-600">{s.n}</span>
              <h3 className="mt-1 text-base font-bold text-stone-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 책 고르기 */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl text-stone-900">픽북 고르기</h2>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'all' as const, label: '전체' }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${
                  category === c.id ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((b) => (
            <BookCard key={b.id} book={b} open={canOpenBook(b, access)} />
          ))}
        </div>
      </section>

      {/* 랭킹 미리 보기 */}
      {rankingBook ? (
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl text-stone-900">「{rankingBook.title}」 랭킹</h2>
              <Link to="/ranking" className="text-sm font-bold text-orange-700 hover:underline">
                전체 랭킹 →
              </Link>
            </div>
            <div className="mt-4">
              <RankingTable bookId={rankingBook.id} top={5} />
            </div>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  )
}
