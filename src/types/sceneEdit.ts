/** 장면 전환 — VisualStage LayerPicture와 동일 계열 */
export type SceneTransition = 'none' | 'fade' | 'crossfade' | 'slide-left' | 'slide-right'

/** 연출·무대 효과 (가벼운 프레젠테이션) */
export type SceneStaging = 'none' | 'ken-burns' | 'vignette' | 'soft-zoom'

/** 마스터가 겹치는 짧은 자막 위치 */
export type TextOverlayPosition = 'top' | 'center' | 'bottom'

/** 패널(컷) 하나에 대한 마스터 연출 설정 */
export type PanelSceneEdit = {
  transition: SceneTransition
  staging: SceneStaging
  textOverlay?: {
    text: string
    position: TextOverlayPosition
  }
}

export const SCENE_TRANSITION_OPTIONS: { value: SceneTransition; label: string }[] = [
  { value: 'none', label: '즉시 전환' },
  { value: 'fade', label: '페이드' },
  { value: 'crossfade', label: '크로스페이드' },
  { value: 'slide-left', label: '왼쪽으로 슬라이드' },
  { value: 'slide-right', label: '오른쪽으로 슬라이드' },
]

export const SCENE_STAGING_OPTIONS: { value: SceneStaging; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'ken-burns', label: '천천히 확대 (켄 번스)' },
  { value: 'vignette', label: '가장자리 어둡게' },
  { value: 'soft-zoom', label: '은은한 줌' },
]

export const TEXT_OVERLAY_POSITION_OPTIONS: { value: TextOverlayPosition; label: string }[] = [
  { value: 'top', label: '위' },
  { value: 'center', label: '가운데' },
  { value: 'bottom', label: '아래' },
]

export function defaultPanelSceneEdit(): PanelSceneEdit {
  return { transition: 'crossfade', staging: 'none' }
}
