import type { SentenceTimeline } from '../types/timeline'

export type TimelineExportBundle = {
  exportedAt: string
  bookId: string
  bookTitle: string
  timelines: Record<string, SentenceTimeline>
}

/** 편집 백업용 JSON 다운로드 */
export function downloadTimelineBundle(bookId: string, bookTitle: string, timelines: Record<string, SentenceTimeline>): void {
  const bundle: TimelineExportBundle = {
    exportedAt: new Date().toISOString(),
    bookId,
    bookTitle,
    timelines,
  }
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `picbook-timeline-${bookId}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
