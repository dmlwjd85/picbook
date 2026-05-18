/** v28 연출 수정 패널 배포 */
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { PANEL_H, PANEL_W } from './outpaint-panel-3x2.mjs'

const assetsDir = path.join(
  process.env.USERPROFILE ?? '',
  '.cursor',
  'projects',
  'c-Project',
  'assets',
)
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'demo', 'proverbs')

const FILES = [
  ['whale-shrimp-05-v5.png', 'proverbs-whale-shrimp-05.png'],
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => {
    const num = String(n).padStart(2, '0')
    return [
      [`steady-tower-${num}-v2.png`, `proverbs-steady-tower-${num}.png`],
      [`cat-bell-${num}-v2.png`, `proverbs-cat-bell-${num}.png`],
    ]
  }),
]

for (const [srcName, destName] of FILES) {
  const src = path.join(assetsDir, srcName)
  if (!existsSync(src)) throw new Error(`missing ${src}`)
  const dest = path.join(outDir, destName)
  await sharp(src)
    .resize(PANEL_W, PANEL_H, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(dest)
  console.log('wrote', destName)
}
