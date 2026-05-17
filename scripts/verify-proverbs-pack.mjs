/**
 * 배포 전 속담 이미지 파일 존재·3:2 비율 검증 (삼권분립 samgwon 컷과 동일)
 * 사용: node scripts/verify-proverbs-pack.mjs
 */
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const TARGET_W = 1536
const TARGET_H = 1024

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public', 'demo', 'proverbs')

const PREFIXES = [
  'proverbs-kind-words',
  'proverbs-drizzle',
  'proverbs-oak-pine',
  'proverbs-branches',
  'proverbs-liver',
  'proverbs-taesan',
  'proverbs-persimmon',
  'proverbs-river-fire',
  'proverbs-frog',
  'proverbs-dung',
]

let failed = false

async function verify() {
  for (const prefix of PREFIXES) {
    for (let i = 1; i <= 6; i += 1) {
      const name = `${prefix}-${String(i).padStart(2, '0')}.png`
      const filePath = join(publicDir, name)
      if (!existsSync(filePath)) {
        console.error(`FAIL: missing ${name}`)
        failed = true
        continue
      }
      const meta = await sharp(filePath).metadata()
      if (meta.width !== TARGET_W || meta.height !== TARGET_H) {
        console.error(
          `FAIL: ${name} expected ${TARGET_W}x${TARGET_H}, got ${meta.width}x${meta.height}`,
        )
        failed = true
      }
    }
  }

  if (!existsSync(join(publicDir, 'proverbs-cover.png'))) {
    console.error('FAIL: missing proverbs-cover.png')
    failed = true
  }

  if (failed) process.exit(1)
  console.log(`OK: all proverb panel images present (${TARGET_W}x${TARGET_H}, 3:2)`)
}

await verify()
