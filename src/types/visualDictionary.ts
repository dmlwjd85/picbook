/** 수어·의미 청크 시각 사전 — 품사(레이어 역할) */
export type VisualPartOfSpeech =
  | 'background'
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'emotion'
  | 'effect'
  | 'particle'

export type VisualDictionaryStatus = 'draft' | 'ready' | 'deprecated'

/** Firestore visual_dictionary / 로컬 시드 공통 스키마 */
export type VisualDictionaryEntry = {
  word_id: string
  word: string
  synonyms: string[]
  part_of_speech: VisualPartOfSpeech
  /** public/visual-dictionary/... 기준 파일명 */
  file_name: string
  image_direction: string
  z_index: number
  tags: string[]
  /** 타자 청크 매칭 힌트(쉼표 구분 문자열 또는 배열) */
  chunk_hints: string[]
  /** 같은 값이면 한 화면에 함께 표시 (예: 토끼+거북이) */
  combine_group?: string
  status: VisualDictionaryStatus
  /** 배포 후 Firebase Storage URL (없으면 로컬 public 경로) */
  image_url?: string
  updated_at?: string
  /** 청크 레이어 하단 막대에 표시할 설명(예: 권력(권리와 힘)) */
  plate_caption?: string
}

export type VisualDictionaryInsertMode = 'background' | 'overlay' | 'frame'
