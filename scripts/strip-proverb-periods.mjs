/**
 * 속담 본문(_TEXT) 끝 마침표 제거, 큐 바늘에서 '.' 제거
 * node scripts/strip-proverb-periods.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.ts'))

let changed = 0
for (const file of files) {
  const fp = path.join(dataDir, file)
  let src = fs.readFileSync(fp, 'utf8')
  const before = src

  /** ASI로 세미콜론이 다음 줄에 없을 수 있음 */
  src = src.replace(/(export const \w+_TEXT = ')([^']+)\.('\s*;?)/g, (_, head, body, tail) => `${head}${body}${tail}`)
  src = src.replace(/(const OUTRO_TEXT = ')([^']+)\.('\s*;?)/g, (_, head, body, tail) => `${head}${body}${tail}`)
  src = src.replace(/,\s*'\.'\s*(?=[,\]])/g, '')
  src = src.replace(/\[\s*'\.'\s*\]/g, '[]')

  if (src !== before) {
    fs.writeFileSync(fp, src)
    console.log('updated', file)
    changed += 1
  }
}

console.log(`\n${changed} file(s) updated`)
