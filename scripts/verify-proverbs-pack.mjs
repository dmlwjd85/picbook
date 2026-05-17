/**
 * 배포 전 속담 이미지 파일 존재·3:2 비율 검증 (삼권분립 samgwon 컷과 동일)
 * 사용: node scripts/verify-proverbs-pack.mjs
 */
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

/** 3:2 비율·해상도 (삼권 samgwon과 동일) */
const RATIO = 3 / 2
const RATIO_EPS = 0.02
const MIN_W = 1200
const MIN_H = 800

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
      const ratio = meta.width / meta.height
      if (Math.abs(ratio - RATIO) > RATIO_EPS) {
        console.error(
          `FAIL: ${name} expected 3:2 ratio, got ${meta.width}x${meta.height} (${ratio.toFixed(3)})`,
        )
        failed = true
      }
      if (meta.width < MIN_W || meta.height < MIN_H) {
        console.error(
          `FAIL: ${name} too small ${meta.width}x${meta.height}, want ≥${MIN_W}x${MIN_H} (run batch-outpaint-proverbs)`,
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
  console.log('OK: all proverb panel images present (3:2 ratio)')
}

await verify()
