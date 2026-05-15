import type { ReadingPack } from '../types/pack'

export function parsePackJson(raw: string): { ok: true; pack: ReadingPack } | { ok: false; error: string } {
  try {
    const o = JSON.parse(raw) as ReadingPack
    if (o.formatVersion !== 1) {
      return { ok: false, error: '지원하지 않는 팩 버전입니다. formatVersion 1만 지원합니다.' }
    }
    if (!o.id || typeof o.id !== 'string') return { ok: false, error: '팩 id가 없습니다.' }
    if (!Array.isArray(o.sentences) || o.sentences.length === 0) {
      return { ok: false, error: '문장(sentences) 배열이 비어 있습니다.' }
    }
    for (const s of o.sentences) {
      if (!s.id || typeof s.text !== 'string') return { ok: false, error: '문장 데이터가 올바르지 않습니다.' }
      if (!Array.isArray(s.layers)) return { ok: false, error: '레이어 배열이 없습니다.' }
      if (!Array.isArray(s.cues)) return { ok: false, error: '큐 배열이 없습니다.' }
      if (s.captions !== undefined && !Array.isArray(s.captions)) {
        return { ok: false, error: 'captions는 배열이어야 합니다.' }
      }
    }
    return { ok: true, pack: o }
  } catch {
    return { ok: false, error: 'JSON 파싱에 실패했습니다.' }
  }
}
