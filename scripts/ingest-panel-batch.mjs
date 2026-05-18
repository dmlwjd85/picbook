/**
 * 생성된 3:2 패널을 public/demo/proverbs/ 에 배치
 * 사용: node scripts/ingest-panel-batch.mjs <slug> <생성png폴더>
 * 예: node scripts/ingest-panel-batch.mjs kind-words C:/path/to/kind-words-panels
 */
import { existsSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { PANEL_H, PANEL_W } from './outpaint-panel-3x2.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'public', 'demo', 'proverbs')

const slug = process.argv[2]
const srcFolder = process.argv[3]
if (!slug || !srcFolder) {
  console.error('Usage: node scripts/ingest-panel-batch.mjs <slug> <folder>')
  process.exit(1)
}

const prefix = `proverbs-${slug}`

for (let i = 1; i <= 6; i += 1) {
  const num = String(i).padStart(2, '0')
  const candidates = [
    path.join(srcFolder, `${slug}-${num}.png`),
    path.join(srcFolder, `${num}.png`),
    path.join(srcFolder, `panel-${num}.png`),
  ]
  const src = candidates.find((p) => existsSync(p))
  if (!src) {
    console.error('missing panel', num, 'in', srcFolder)
    process.exit(1)
  }
  const out = path.join(outDir, `${prefix}-${num}.png`)
  await sharp(src)
    .resize(PANEL_W, PANEL_H, { fit: 'cover', position: 'centre', kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(out)
  const m = await sharp(out).metadata()
  console.log('wrote', path.basename(out), `${m.width}x${m.height}`)
}
