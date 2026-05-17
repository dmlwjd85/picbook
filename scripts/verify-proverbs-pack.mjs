/**
 * 배포 전 속담 이미지 파일 존재 검증
 * 사용: node scripts/verify-proverbs-pack.mjs
 */
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public', 'demo', 'proverbs')

const PREFIXES = [
  'proverbs-kind-words',
  'proverbs-drizzle',
  'proverbs-oak-pine',
  'proverbs-branches',
  'proverbs-liver',
]

let failed = false

for (const prefix of PREFIXES) {
  for (let i = 1; i <= 6; i += 1) {
    const name = `${prefix}-${String(i).padStart(2, '0')}.png`
    const path = join(publicDir, name)
    if (!existsSync(path)) {
      console.error(`FAIL: missing ${name}`)
      failed = true
    }
  }
}

if (!existsSync(join(publicDir, 'proverbs-cover.png'))) {
  console.error('FAIL: missing proverbs-cover.png')
  failed = true
}

if (failed) process.exit(1)
console.log('OK: all proverb panel images present')
