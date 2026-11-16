// src/content/picbooks/*.json 검사 — 빌드 전에 돌아 잘못된 픽북이 배포되지 않게 한다.
// 실행: npm run verify:picbooks
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'src/content/picbooks'
const CATEGORIES = ['fairy-tale', 'curriculum', 'proverb', 'quote', 'etc']
const MIN = 4
const MAX = 8

const errors = []
const ids = new Set()
const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_')) : []

for (const file of files) {
  const at = (msg) => errors.push(`${file}: ${msg}`)
  let m
  try {
    m = JSON.parse(readFileSync(join(DIR, file), 'utf8'))
  } catch (e) {
    at(`JSON을 읽을 수 없음 (${e.message})`)
    continue
  }
  if (typeof m.id !== 'string' || !/^[a-z0-9-]+$/.test(m.id)) at('id는 영문 소문자·숫자·하이픈만')
  else if (`${m.id}.json` !== file) at(`id(${m.id})와 파일 이름이 달라요`)
  if (ids.has(m.id)) at(`id 중복: ${m.id}`)
  ids.add(m.id)
  if (!m.title?.trim()) at('title이 비어 있음')
  if (!CATEGORIES.includes(m.category)) at(`category는 ${CATEGORIES.join(' | ')} 중 하나`)
  if (m.category === 'curriculum' && !(Number.isInteger(m.grade) && m.grade >= 1 && m.grade <= 6)) {
    at('교과(curriculum)는 grade 1~6이 필요')
  }
  if (!Array.isArray(m.sentences) || m.sentences.length === 0) {
    at('sentences가 비어 있음')
    continue
  }
  m.sentences.forEach((s, i) => {
    const n = `문장 ${i + 1}`
    const text = typeof s.text === 'string' ? s.text : ''
    if (!text.trim()) at(`${n}: text가 비어 있음`)
    if (text !== text.trim() || /\s{2,}|\n/.test(text)) at(`${n}: 앞뒤 공백·줄바꿈·연속 공백 없이`)
    const images = Array.isArray(s.images) ? s.images : []
    if (images.length < MIN || images.length > MAX) at(`${n}: 그림은 ${MIN}~${MAX}장 (지금 ${images.length}장)`)
    if (text.length < images.length) at(`${n}: 문장이 그림 수보다 짧음`)
    for (const img of images) {
      if (/^https?:/.test(img)) continue
      if (!existsSync(join('public', img))) at(`${n}: 그림 파일 없음 public/${img}`)
    }
    if (s.cueIndexes !== undefined) {
      const c = s.cueIndexes
      const valid =
        Array.isArray(c) &&
        c.length === images.length &&
        c[0] === 0 &&
        c.every((v, k) => Number.isInteger(v) && v < text.length && (k === 0 || v > c[k - 1]))
      if (!valid) at(`${n}: cueIndexes는 그림 수와 같은 길이, 0으로 시작, 오름차순, 문장 길이 미만`)
    }
  })
}

if (errors.length > 0) {
  console.error(`픽북 검사 실패 (${errors.length}건)\n` + errors.map((e) => ` - ${e}`).join('\n'))
  process.exit(1)
}
console.log(`픽북 검사 통과: ${files.length}권`)
