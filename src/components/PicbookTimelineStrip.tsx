/** 글자별 타임라인 눈금 — 한 글자 = 한 프레임 */

type Props = {
  text: string
  selectedIndex: number
  editedIndices: Set<number>
  insertAfterIndices: Set<number>
  onSelect: (index: number) => void
}

export function PicbookTimelineStrip({
  text,
  selectedIndex,
  editedIndices,
  insertAfterIndices,
  onSelect,
}: Props) {
  const chars = [...text]

  return (
    <div className="picbook-timeline-strip">
      <p className="mb-1 text-[10px] font-medium text-slate-500">
        한 글자 = 한 프레임 · 0 = 입력 전 · 노란 칸 = 편집됨 · 보라 막대 = 삽입 컷
      </p>
      <div className="flex min-w-0 gap-0.5 overflow-x-auto pb-1">
        <button
          type="button"
          title="0글자 — 아직 입력 전"
          onClick={() => onSelect(0)}
          className={cellCls(selectedIndex === 0, editedIndices.has(0))}
        >
          <span className="text-[9px] opacity-80">0</span>
        </button>
        {chars.map((ch, i) => {
          const frameIndex = i + 1
          const hasInsert = insertAfterIndices.has(i)
          return (
            <span key={`${i}-${ch}`} className="flex shrink-0 items-stretch gap-0.5">
              <button
                type="button"
                title={`${frameIndex}글자: 「${ch}」`}
                onClick={() => onSelect(frameIndex)}
                className={cellCls(selectedIndex === frameIndex, editedIndices.has(frameIndex))}
              >
                <span className="max-w-[1.25rem] truncate text-[11px] font-bold">{ch}</span>
              </button>
              {hasInsert ? (
                <span
                  className="flex w-1 shrink-0 items-center justify-center"
                  title={`${i}글자 뒤 삽입 컷`}
                >
                  <span className="h-full w-0.5 rounded-full bg-fuchsia-500" />
                </span>
              ) : null}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function cellCls(active: boolean, edited: boolean): string {
  return [
    'flex h-9 min-w-[1.6rem] shrink-0 flex-col items-center justify-center rounded-md border px-0.5 transition',
    active
      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200'
      : edited
        ? 'border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100'
        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50',
  ].join(' ')
}
