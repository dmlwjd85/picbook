import { usePicbookSceneEditStore } from '../state/picbookSceneEditStore'
import { usePicbookTimelineStore } from '../state/picbookTimelineStore'
import type { CloudAccountPayload } from './accountCloudSync'

/** 클라우드에서 받은 타임라인·연출을 로컬에 병합 */
export function importCloudMasterData(cloud: CloudAccountPayload): void {
  usePicbookTimelineStore.setState((s) => ({
    byBook: mergeBookRecords(s.byBook, cloud.timelines),
  }))
  usePicbookSceneEditStore.setState((s) => ({
    editsByBook: mergeBookRecords(s.editsByBook, cloud.sceneEditsByBook),
  }))
}

function mergeBookRecords<T extends Record<string, unknown>>(
  local: Record<string, T>,
  remote: Record<string, T>,
): Record<string, T> {
  const out = { ...local }
  for (const [bookId, remoteBook] of Object.entries(remote)) {
    out[bookId] = { ...(out[bookId] ?? {}), ...remoteBook } as T
  }
  return out
}
