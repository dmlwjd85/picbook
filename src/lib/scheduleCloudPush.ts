import { isCloudSyncEnabled } from './accountCloudSync'
import { usePicbookSceneEditStore } from '../state/picbookSceneEditStore'
import { usePicbookTimelineStore } from '../state/picbookTimelineStore'
import { useUserAccountStore } from '../state/userAccountStore'

let timer: ReturnType<typeof setTimeout> | null = null
let subscribed = false

/** 타임라인·연출 변경 후 클라우드에 자동 저장(2초 디바운스) */
export function scheduleCloudPush(): void {
  if (!isCloudSyncEnabled()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    void useUserAccountStore.getState().pushCloudSnapshot()
  }, 2000)
}

/** 앱 시작 시 한 번 — 연출 스토어 변경 감지 */
export function initCloudSyncSubscriptions(): void {
  if (!isCloudSyncEnabled() || subscribed) return
  subscribed = true
  usePicbookTimelineStore.subscribe((s, p) => {
    if (s.byBook !== p.byBook) scheduleCloudPush()
  })
  usePicbookSceneEditStore.subscribe((s, p) => {
    if (s.editsByBook !== p.editsByBook) scheduleCloudPush()
  })
}
