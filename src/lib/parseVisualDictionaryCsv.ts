import type { VisualDictionaryEntry, VisualPartOfSpeech } from '../types/visualDictionary'

const POS_SET = new Set<VisualPartOfSpeech>([
  'background',
  'noun',
  'verb',
  'adjective',
  'emotion',
  'effect',
  'particle',
])

function splitList(cell: string): string[] {
  return cell
    .split(/[,，、]/)
    .map((s) => s.trim().replace(/^"|"$/g, ''))
    .filter(Boolean)
}

function parseRow(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuote = !inQuote
      continue
    }
    if ((ch === ',' || ch === '\t') && !inQuote) {
      cells.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  cells.push(cur.trim())
  return cells
}

function normHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_')
}

/** 엑셀에서 저장한 CSV(UTF-8) → 사전 항목 */
export function parseVisualDictionaryCsv(text: string): VisualDictionaryEntry[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const rawHeaders = parseRow(lines[0]!)
  const headers = rawHeaders.map(normHeader)

  const col = (row: string[], ...names: string[]) => {
    for (const name of names) {
      const i = headers.indexOf(name)
      if (i >= 0) return row[i] ?? ''
    }
    return ''
  }

  const entries: VisualDictionaryEntry[] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]!)
    if (row.every((c) => !c)) continue

    const word = col(row, 'word', '표제어', '단어')
    if (!word) continue

    const word_id = col(row, 'word_id', '단어id', '아이디') || `w_import_${i}`
    const posRaw = col(row, 'part_of_speech', '품사', 'pos') as VisualPartOfSpeech
    const part_of_speech = POS_SET.has(posRaw) ? posRaw : 'noun'
    const statusRaw = col(row, 'status', '상태')
    const status =
      statusRaw === 'ready' || statusRaw === 'deprecated' ? statusRaw : ('draft' as const)

    entries.push({
      word_id,
      word,
      synonyms: splitList(col(row, 'synonyms', '유사어')),
      part_of_speech,
      file_name: col(row, 'file_name', '파일명', '파일') || `n_${word_id}.png`,
      image_direction: col(row, 'image_direction', '이미지연출', '연출메모', '이미지_연출'),
      z_index: Number(col(row, 'z_index', 'zindex', '레이어순서')) || 20,
      tags: splitList(col(row, 'tags', '태그')),
      chunk_hints: splitList(col(row, 'chunk_hints', 'chunk_hint', '청크힌트', '청크')),
      status,
    })
  }

  return entries
}
