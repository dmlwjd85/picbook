/**
 * Cursor assets에 생성된 3:2 패널(60장) → public/demo/proverbs/
 * 실행: node scripts/publish-all-generated-panels.mjs [assets폴더]
 */
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { PANEL_H, PANEL_W } from './outpaint-panel-3x2.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const defaultAssets = path.join(
  process.env.USERPROFILE ?? '',
  '.cursor',
  'projects',
  'c-Project',
  'assets',
)
const assetsDir = process.argv[2] ? path.resolve(process.argv[2]) : defaultAssets
const outDir = path.join(root, 'public', 'demo', 'proverbs')

const SLUGS = [
  'kind-words',
  'drizzle',
  'oak-pine',
  'branches',
  'liver',
  'taesan',
  'persimmon',
  'river-fire',
  'frog',
  'dung',
]

if (!existsSync(assetsDir)) {
  console.error('assets folder not found:', assetsDir)
  process.exit(1)
}

let ok = 0
for (const slug of SLUGS) {
  const prefix = `proverbs-${slug}`
  for (let i = 1; i <= 6; i += 1) {
    const num = String(i).padStart(2, '0')
    const src = path.join(assetsDir, `${slug}-${num}.png`)
    if (!existsSync(src)) {
      console.error('missing', src)
      process.exit(1)
    }
    const dest = path.join(outDir, `${prefix}-${num}.png`)
    const meta = await sharp(src).metadata()
    const ratio = meta.width / meta.height
    let pipe = sharp(src)
    if (Math.abs(ratio - 1.5) > 0.02 || meta.width !== PANEL_W || meta.height !== PANEL_H) {
      pipe = pipe.resize(PANEL_W, PANEL_H, {
        fit: 'cover',
        position: 'centre',
        kernel: sharp.kernel.lanczos3,
      })
    }
    await pipe.png({ compressionLevel: 9 }).toFile(dest)
    ok += 1
    console.log('published', path.basename(dest))
  }
}

console.log(`done: ${ok} panels → ${outDir}`)
