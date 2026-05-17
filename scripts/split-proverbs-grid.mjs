/**
 * 3×2 만화 그리드 원본을 6컷으로 잘라 public/demo/proverbs/ 에 저장
 * - 그리드 권장: 4608×2048 (셀당 1536×1024, 3:2)
 * - 레거시 1536×1024 그리드(셀 512×512)는 batch-outpaint-proverbs.mjs 사용
 * 사용: node scripts/split-proverbs-grid.mjs <원본.png> <출력접두사>
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { PANEL_H, PANEL_W } from './outpaint-panel-3x2.mjs'

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
  const cellRatio = cellW / cellH

  /** 셀이 이미 3:2면 그대로 저장, 아니면 3:2 캔버스에 fit inside */
  const native32 = Math.abs(cellRatio - 1.5) < 0.03
  const targetW = native32 ? cellW : PANEL_W
  const targetH = native32 ? cellH : PANEL_H

  let n = 1
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const out = path.join(outDir, `${prefix}-${String(n).padStart(2, '0')}.png`)
      const extracted = sharp(absIn).extract({
        left: Math.round(col * cellW),
        top: Math.round(row * cellH),
        width: cellW,
        height: cellH,
      })

      if (native32) {
        await extracted
          .resize(targetW, targetH, { fit: 'fill', withoutEnlargement: true })
          .png({ compressionLevel: 9 })
          .toFile(out)
      } else {
        const cellBuf = await extracted
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
      }
      console.log('wrote', out, `(${targetW}x${targetH})`)
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
