import type { VisualPartOfSpeech } from '../types/visualDictionary'

const base = import.meta.env.BASE_URL

/** 품사 → 저장 하위 폴더 */
export function folderForPartOfSpeech(pos: VisualPartOfSpeech): string {
  switch (pos) {
    case 'background':
      return 'backgrounds'
    case 'noun':
      return 'nouns'
    case 'verb':
      return 'verbs'
    case 'adjective':
      return 'adjectives'
    case 'emotion':
      return 'emotions'
    case 'effect':
      return 'effects'
    case 'particle':
      return 'particles'
    default:
      return 'nouns'
  }
}

/** 파일명 접두사로 폴더 추정 (엑셀 file_name 열) */
export function folderFromFileName(fileName: string): string {
  const n = fileName.toLowerCase()
  if (n.startsWith('bg_')) return 'backgrounds'
  if (n.startsWith('n_')) return 'nouns'
  if (n.startsWith('v_')) return 'verbs'
  if (n.startsWith('a_')) return 'adjectives'
  if (n.startsWith('e_')) return 'emotions'
  if (n.startsWith('fx_')) return 'effects'
  if (n.startsWith('p_')) return 'particles'
  return 'nouns'
}

/** 브라우저에서 쓸 로컬 에셋 URL */
export function localVisualAssetUrl(fileName: string, pos?: VisualPartOfSpeech): string {
  const folder = pos ? folderForPartOfSpeech(pos) : folderFromFileName(fileName)
  return `${base}visual-dictionary/${folder}/${fileName}`
}

export function resolveVisualImageUrl(entry: {
  file_name: string
  part_of_speech: VisualPartOfSpeech
  image_url?: string
}): string {
  return entry.image_url?.trim() || localVisualAssetUrl(entry.file_name, entry.part_of_speech)
}
