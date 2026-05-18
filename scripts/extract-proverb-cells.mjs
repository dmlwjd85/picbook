/**
 * _src 그리드에서 6컷 정사각 셀 추출 → scripts/_gen_refs/
 */
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const srcDir = path.join(root, 'public', 'demo', 'proverbs', '_src')
const outDir = path.join(__dirname, '_gen_refs')

const SETS = [
  ['kind-words-grid.png', 'kind-words'],
  ['drizzle-grid.png', 'drizzle'],
  ['oak-pine-grid.png', 'oak-pine'],
  ['branches-grid.png', 'branches'],
  ['liver-grid.png', 'liver'],
  ['taesan-grid.png', 'taesan'],
  ['persimmon-grid.png', 'persimmon'],
  ['river-fire-grid.png', 'river-fire'],
  ['frog-grid.png', 'frog'],
  ['dung-grid.png', 'dung'],
]

const COLS = 3
const ROWS = 2

mkdirSync(outDir, { recursive: true })

for (const [gridFile, slug] of SETS) {
  const gridPath = path.join(srcDir, gridFile)
  if (!existsSync(gridPath)) {
    console.error('missing', gridPath)
    continue
  }
  const meta = await sharp(gridPath).metadata()
  const cellW = Math.round(meta.width / COLS)
  const cellH = Math.round(meta.height / ROWS)
  const side = Math.min(cellW, cellH)
  let n = 1
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const left = Math.round(col * cellW + (cellW - side) / 2)
      const top = Math.round(row * cellH + (cellH - side) / 2)
      const out = path.join(outDir, `${slug}-${String(n).padStart(2, '0')}.png`)
      await sharp(gridPath)
        .extract({ left, top, width: side, height: side })
        .png()
        .toFile(out)
      n += 1
    }
  }
}

console.log('extracted cells to', outDir)
