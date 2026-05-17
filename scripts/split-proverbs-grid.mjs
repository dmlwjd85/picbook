/**
 * 3×2 만화 그리드 원본을 6컷으로 잘라 public/demo/proverbs/ 에 저장
 * 사용: node scripts/split-proverbs-grid.mjs <원본.png> <출력접두사>
 * 예: node scripts/split-proverbs-grid.mjs public/demo/proverbs/_src/kind-words-grid.png proverbs-kind-words
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'public', 'demo', 'proverbs')

const COLS = 3
const ROWS = 2
/** 삼권분립 samgwon·powers 컷과 동일 3:2 */
const TARGET_W = 1536
const TARGET_H = 1024

async function splitGrid(inputPath, prefix) {
  const absIn = path.isAbsolute(inputPath) ? inputPath : path.join(root, inputPath)
  const meta = await sharp(absIn).metadata()
  const cellW = meta.width / COLS
  const cellH = meta.height / ROWS
  let n = 1
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const out = path.join(outDir, `${prefix}-${String(n).padStart(2, '0')}.png`)
      await sharp(absIn)
        .extract({
          left: Math.round(col * cellW),
          top: Math.round(row * cellH),
          width: Math.round(cellW),
          height: Math.round(cellH),
        })
        .resize(TARGET_W, TARGET_H, {
          fit: 'inside',
          background: { r: 28, g: 25, b: 23 },
        })
        .png({ compressionLevel: 9 })
        .toFile(out)
      console.log('wrote', out)
      n += 1
    }
  }
}

const input = process.argv[2]
const prefix = process.argv[3]
if (!input || !prefix) {
  console.error('Usage: node scripts/split-proverbs-grid.mjs <input.png> <prefix>')
  process.exit(1)
}

await splitGrid(input, prefix)
