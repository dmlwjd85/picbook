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

async function splitGrid(inputPath, prefix) {
  const absIn = path.isAbsolute(inputPath) ? inputPath : path.join(root, inputPath)
  const meta = await sharp(absIn).metadata()
  const cellW = Math.round(meta.width / COLS)
  const cellH = Math.round(meta.height / ROWS)
  /** 컷당 3:2 캔버스 — 원본보다 키우지 않음(업스케일 흐림 방지) */
  const targetW = cellW
  const targetH = Math.round((cellW * 2) / 3)
  let n = 1
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const out = path.join(outDir, `${prefix}-${String(n).padStart(2, '0')}.png`)
      const cellBuf = await sharp(absIn)
        .extract({
          left: Math.round(col * cellW),
          top: Math.round(row * cellH),
          width: cellW,
          height: cellH,
        })
        .resize(targetW, targetH, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer()
      await sharp({
        create: {
          width: targetW,
          height: targetH,
          channels: 3,
          background: { r: 28, g: 25, b: 23 },
        },
      })
        .composite([{ input: cellBuf, gravity: 'center' }])
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
