import { useState } from 'react'
import { downloadTimelineBundle } from '../lib/exportTimelineBundle'
import { publishBookTimelines } from '../lib/publishedTimelineFirebase'
import { publishCustomPicbook } from '../lib/customPicbookFirebase'
import { isFirebaseEnabled } from '../lib/firebase'
import { useUserAccountStore } from '../state/userAccountStore'
import { useCustomPicbookStore } from '../state/customPicbookStore'
import { useVisualDictionaryStore } from '../state/visualDictionaryStore'
import type { SentenceTimeline } from '../types/timeline'

type Props = {
  bookId: string
  bookTitle: string
  timelines: Record<string, SentenceTimeline>
  /** 청크·사전 연동 픽북 — 배포 시 사전·커스텀 메타도 함께 */
  visualDictionaryStoryId?: string
  isCustomBook?: boolean
}

export function EditorDeployBar({
  bookId,
  bookTitle,
  timelines,
  visualDictionaryStoryId,
  isCustomBook,
}: Props) {
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const pushCloud = useUserAccountStore((s) => s.pushCloudSnapshot)

  const onSave = async () => {
    setBusy(true)
    setStatus(null)
    try {
      await pushCloud()
      setStatus('저장 완료 — 이 브라우저 + 클라우드(로그인 시)')
    } catch {
      setStatus('저장됨(로컬) — 클라우드는 로그인 후 다시 시도')
    } finally {
      setBusy(false)
    }
  }

  const onDeploy = async () => {
    setBusy(true)
    setStatus(null)
    const parts: string[] = []
    downloadTimelineBundle(bookId, bookTitle, timelines)
    parts.push('백업 JSON')

    if (isFirebaseEnabled()) {
      const ok = await publishBookTimelines(bookId, timelines)
      if (ok) parts.push('타임라인 Firebase')
      else parts.push('타임라인 배포 실패')

      const storyId = visualDictionaryStoryId ?? bookId
      useVisualDictionaryStore.getState().setStoryId(storyId)
      const dictOk = await useVisualDictionaryStore.getState().publishToCloud()
      if (dictOk) parts.push(`사전(${storyId})`)
      else parts.push('사전 배포 실패')

      if (isCustomBook) {
        const meta = useCustomPicbookStore.getState().books.find((b) => b.id === bookId)
        if (meta) {
          useCustomPicbookStore.getState().bumpVersion(bookId)
          const bumped = useCustomPicbookStore.getState().books.find((b) => b.id === bookId)!
          const bookOk = await publishCustomPicbook(bumped)
          if (bookOk) parts.push('커스텀 픽북 메타')
          else parts.push('픽북 메타 실패')
        }
      }
    }
    try {
      await pushCloud()
      parts.push('계정 연동 저장')
    } catch {
      /* ignore */
    }
    setStatus(parts.join(' · '))
    setBusy(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2">
      <span className="text-xs font-semibold text-emerald-900">저장·배포</span>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onSave()}
        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
      >
        저장
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => void onDeploy()}
        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
      >
        배포
      </button>
      {status ? <span className="text-[11px] text-emerald-800">{status}</span> : null}
      {!isFirebaseEnabled() ? (
        <span className="text-[10px] text-amber-800">Firebase 미연결 — JSON만 내려받기</span>
      ) : null}
    </div>
  )
}

