import { useMemo } from 'react'
import { buildChunkVisualLayers } from '../lib/buildChunkVisualLayers'
import { VisualStage } from './VisualStage'
import type { VisualDictionaryEntry } from '../types/visualDictionary'

type Props = {
  /** 현재까지 친(또는 편집 중인) 문장 앞부분 */
  typedPrefix: string
  entries: VisualDictionaryEntry[]
}

/** 수어 사전 — 문장 청크가 재생 화면에서 어떻게 뜨는지 미리보기 */
export function ChunkDictionaryStagingPreview({ typedPrefix, entries }: Props) {
  const layers = useMemo(
    () => buildChunkVisualLayers(typedPrefix, entries),
    [typedPrefix, entries],
  )

  if (!typedPrefix.trim()) {
    return (
      <p className="text-[11px] text-violet-700/90">문장을 입력하거나 타자 시뮬레이션을 움직이면 청크 연출이 여기에 표시됩니다.</p>
    )
  }

  if (layers.length === 0) {
    return <p className="text-[11px] text-slate-500">매칭된 단어가 없습니다. 사전·청크힌트를 확인해 주세요.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-violet-200 bg-stone-950">
      <VisualStage layers={layers} large={false} centerImages />
      <p className="border-t border-violet-100 bg-violet-50/90 px-2 py-1 text-[10px] text-violet-900">
        표시: {layers.map((l) => l.label).join(' · ')} (기본 1장, combine_group 시 다중)
      </p>
    </div>
  )
}
