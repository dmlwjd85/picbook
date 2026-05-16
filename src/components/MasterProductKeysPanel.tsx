import { useState } from 'react'
import { PICBOOK_CATALOG } from '../data/picbookCatalog'

/** 마스터 전용: 카탈로그 제품키 확인·복사 */
export function MasterProductKeysPanel() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyKey = async (id: string, key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000)
    } catch {
      window.prompt('제품키를 복사하세요', key)
    }
  }

  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/90 p-4 text-sm text-violet-950">
      <h2 className="font-bold text-violet-900">픽북 제품키 (마스터)</h2>
      <p className="mt-1 text-xs leading-relaxed text-violet-800/90">
        구매·배포용 키입니다. 팩을 수정·배포할 때는 <code className="rounded bg-violet-100 px-1">packContentVersions.ts</code>
        의 버전을 올리면 구매자에게 자동 반영됩니다.
      </p>
      <ul className="mt-4 space-y-3">
        {PICBOOK_CATALOG.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-200/80 bg-white/80 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="font-semibold text-violet-950">{item.title}</p>
              <p className="text-[11px] text-violet-700/80">
                {item.subtitle}
                {!item.comingSoon ? (
                  <span className="ml-1.5 font-mono text-violet-600">v{item.contentVersion}</span>
                ) : null}
              </p>
            </div>
            {item.comingSoon ? (
              <span className="shrink-0 text-xs font-medium text-slate-500">출판 예정</span>
            ) : (
              <div className="flex shrink-0 items-center gap-2">
                <code className="rounded-md bg-violet-100 px-2 py-1 font-mono text-xs text-violet-900">
                  {item.productKeyDisplay}
                </code>
                <button
                  type="button"
                  onClick={() => void copyKey(item.id, item.productKeyDisplay)}
                  className="rounded-md border border-violet-300 bg-white px-2 py-1 text-[11px] font-semibold text-violet-800 hover:bg-violet-50"
                >
                  {copiedId === item.id ? '복사됨' : '복사'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
