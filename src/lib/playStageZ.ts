/** 실행 화면 — 연출 이미지 z 상한(목표 문장·자막은 항상 그 위) */
export const PLAY_STAGE_IMAGE_Z_MAX = 28

/** 따라 쓸 문장·카라오케·교훈 자막 */
export const PLAY_STAGE_TEXT_Z = 72

export function clampPlayImageZIndex(zIndex: number): number {
  return Math.min(Math.max(0, zIndex), PLAY_STAGE_IMAGE_Z_MAX)
}
