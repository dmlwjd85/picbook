/**
 * 3×2 다컷 한 장 → 6장 분할
 * 실행: node scripts/split-kind-words-grid.mjs [원본경로]
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const src =
  process.argv[2] ??
  'C:/Users/dmlwj/.cursor/projects/c-Project/assets/c__Users_dmlwj_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_______-a2686f8c-2e6d-4fa7-8511-dbe682afcee2.png'

const outDir = path.resolve('public/demo/proverbs')
const cols = 2
const rows = 3

await mkdir(outDir, { recursive: true })

const meta = await sharp(src).metadata()
const fullW = meta.width ?? 1024
const fullH = meta.height ?? 558
const cellW = Math.floor(fullW / cols)
const cellH = Math.floor(fullH / rows)
// 컷 사이 얇은 여백 제거
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
    const out = path.join(outDir, `proverbs-kind-words-${String(n).padStart(2, '0')}.png`)
    await sharp(src)
      .extract({ left, top, width, height })
      .resize(1536, 1024, { fit: 'cover', position: 'centre' })
      .png({ quality: 82, compressionLevel: 9 })
      .toFile(out)
    console.log(`→ ${path.basename(out)} (${width}×${height})`)
  }
}
