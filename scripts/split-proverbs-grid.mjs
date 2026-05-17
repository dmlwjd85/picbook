/**
 * 3×2 다컷 한 장 → 6장 분할
 * 실행: node scripts/split-proverbs-grid.mjs [원본경로] [출력접두사]
 * 예: node scripts/split-proverbs-grid.mjs ./source.png proverbs-drizzle
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const src = process.argv[2]
const prefix = process.argv[3] ?? 'proverbs-panel'
if (!src) {
  console.error('Usage: node scripts/split-proverbs-grid.mjs <source.png> [prefix]')
  process.exit(1)
}

const outDir = path.resolve('public/demo/proverbs')
const cols = 2
const rows = 3

await mkdir(outDir, { recursive: true })

const meta = await sharp(src).metadata()
const fullW = meta.width ?? 1024
const fullH = meta.height ?? 558
const cellW = Math.floor(fullW / cols)
const cellH = Math.floor(fullH / rows)
const trimX = Math.round(cellW * 0.02)
const trimY = Math.round(cellH * 0.03)

let n = 0
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    n++
    const left = col * cellW + trimX
    const top = row * cellH + trimY
    const width = cellW - trimX * 2
    const height = cellH - trimY * 2
    const out = path.join(outDir, `${prefix}-${String(n).padStart(2, '0')}.png`)
    await sharp(src)
      .extract({ left, top, width, height })
      .resize({ width: 1280, withoutEnlargement: true })
      .png({ quality: 82, compressionLevel: 9 })
      .toFile(out)
    console.log(`→ ${path.basename(out)}`)
  }
}
