/** 개똥 속담 v2 패널 배포 (assets의 dung-XX-v2.png) */
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

const VERSION = { '01': 'v3', '02': 'v3', '03': 'v3', '04': 'v2', '05': 'v2', '06': 'v2' }

for (let i = 1; i <= 6; i += 1) {
  const num = String(i).padStart(2, '0')
  const ver = VERSION[num]
  const src = path.join(assetsDir, `dung-${num}-${ver}.png`)
  if (!existsSync(src)) throw new Error(`missing ${src}`)
  const dest = path.join(outDir, `proverbs-dung-${num}.png`)
  await sharp(src)
    .resize(PANEL_W, PANEL_H, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(dest)
  console.log('wrote', path.basename(dest))
}
