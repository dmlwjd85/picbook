/**
 * @deprecated 거울·반사 확장 — 사용 금지. AI 컷 생성 후 publish-all-generated-panels.mjs 사용
 * 속담 그리드(_src)에서 1:1 컷을 추출해 3:2 패널로 변환 (레거시)
 * 실행: node scripts/batch-outpaint-proverbs.mjs
 */
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { outpaintSquareTo32, PANEL_H, PANEL_W } from './outpaint-panel-3x2.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const srcDir = path.join(root, 'public', 'demo', 'proverbs', '_src')
const outDir = path.join(root, 'public', 'demo', 'proverbs')

/** 그리드 파일명 → 출력 접두사 */
const SETS = [
  ['kind-words-grid.png', 'proverbs-kind-words'],
  ['drizzle-grid.png', 'proverbs-drizzle'],
  ['oak-pine-grid.png', 'proverbs-oak-pine'],
  ['branches-grid.png', 'proverbs-branches'],
  ['liver-grid.png', 'proverbs-liver'],
  ['taesan-grid.png', 'proverbs-taesan'],
  ['persimmon-grid.png', 'proverbs-persimmon'],
  ['river-fire-grid.png', 'proverbs-river-fire'],
  ['frog-grid.png', 'proverbs-frog'],
  ['dung-grid.png', 'proverbs-dung'],
]

const COLS = 3
const ROWS = 2

async function extractSquareCell(gridPath, index) {
  const meta = await sharp(gridPath).metadata()
  const cellW = Math.round(meta.width / COLS)
  const cellH = Math.round(meta.height / ROWS)
  const col = (index - 1) % COLS
  const row = Math.floor((index - 1) / COLS)

  // 그리드가 이미 3:2 셀(1536×1024/컷)이면 그대로 추출
  const cellRatio = cellW / cellH
  if (Math.abs(cellRatio - 1.5) < 0.03 && cellW >= 900) {
    return sharp(gridPath)
      .extract({
        left: Math.round(col * cellW),
        top: Math.round(row * cellH),
        width: cellW,
        height: cellH,
      })
      .png()
      .toBuffer()
  }

  // 1:1 셀(512×512 등) — 정사각만 추출
  const side = Math.min(cellW, cellH)
  const offsetX = Math.round(col * cellW + (cellW - side) / 2)
  const offsetY = Math.round(row * cellH + (cellH - side) / 2)
  return sharp(gridPath)
    .extract({ left: offsetX, top: offsetY, width: side, height: side })
    .png()
    .toBuffer()
}

async function processSet(gridFile, prefix) {
  const gridPath = path.join(srcDir, gridFile)
  if (!existsSync(gridPath)) {
    console.error('skip missing', gridPath)
    return
  }
  for (let i = 1; i <= 6; i += 1) {
    const square = await extractSquareCell(gridPath, i)
    const meta = await sharp(square).metadata()
    const ratio = meta.width / meta.height

    let outBuf
    if (Math.abs(ratio - 1.5) < 0.03 && meta.width >= PANEL_W - 4 && meta.height >= PANEL_H - 4) {
      outBuf = await sharp(square)
        .resize(PANEL_W, PANEL_H, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
        .png({ compressionLevel: 9 })
        .toBuffer()
    } else {
      outBuf = await outpaintSquareTo32(square)
    }

    const outPath = path.join(outDir, `${prefix}-${String(i).padStart(2, '0')}.png`)
    await sharp(outBuf)
      .png({ quality: 82, compressionLevel: 9, palette: true, effort: 10 })
      .toFile(outPath)
    const m = await sharp(outPath).metadata()
    console.log('wrote', path.basename(outPath), `${m.width}x${m.height}`)
  }
}

for (const [grid, prefix] of SETS) {
  await processSet(grid, prefix)
}

console.log('done: all proverb panels at', `${PANEL_W}x${PANEL_H}`)
