import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useBookStore } from '../store/useBookStore'

export function Editor() {
  const fullText = useBookStore((s) => s.fullText)
  const setFullText = useBookStore((s) => s.setFullText)
  const sentences = useBookStore((s) => s.sentences)

  const stats = useMemo(() => {
    const done = sentences.filter((x) => x.status === 'done').length
    const loading = sentences.filter((x) => x.status === 'loading').length
    const idle = sentences.filter((x) => x.status === 'idle').length
    return { done, loading, idle, total: sentences.length }
  }, [sentences])

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFullText(e.target.value)
  }

  return (
    <section className="h-full flex flex-col border-r border-slate-200 bg-white/70">
      <header className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Picturing Book</h1>
            <p className="text-sm text-slate-500">
              마침표/물음표/느낌표/줄바꿈 기준으로 문장을 분리하고, 완성된 문장부터 이미지가
              순차 생성됩니다.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              to="/draft/pages"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              문장 페이지 보기
            </Link>
          <div className="text-xs text-slate-500 whitespace-nowrap">
            <div>
              총 <span className="font-medium text-slate-800">{stats.total}</span>문장
            </div>
            <div className="mt-1 flex gap-2">
              <span>
                완료 <span className="font-medium text-slate-800">{stats.done}</span>
              </span>
              <span>
                생성중 <span className="font-medium text-slate-800">{stats.loading}</span>
              </span>
              <span>
                대기 <span className="font-medium text-slate-800">{stats.idle}</span>
              </span>
            </div>
          </div>
          </div>
        </div>
      </header>

      <div className="p-5 flex-1 overflow-hidden">
        <textarea
          value={fullText}
          onChange={onChange}
          placeholder={
            '예시) 오늘은 비가 왔다.\n그래서 집에서 책을 읽었다!\n그 장면을 그림일기로 남겼다?'
          }
          className={[
            'w-full h-full resize-none rounded-xl border border-slate-200 bg-white/80',
            'px-4 py-4 leading-relaxed text-[17px] text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300',
            'shadow-sm',
          ].join(' ')}
          style={{
            fontFamily: 'var(--pb-font)',
          }}
        />
      </div>

      <footer className="px-5 py-4 border-t border-slate-200 text-xs text-slate-500">
        현재 단계의 이미지 생성은 <span className="font-medium text-slate-700">Mock</span>이며,
        추후 로컬 GPU API(ComfyUI 등)로 교체할 수 있도록 분리돼 있습니다.
      </footer>
    </section>
  )
}

