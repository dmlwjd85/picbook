/** 16~30편 속담 패널 배포 */
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

const SLUGS = [
  'ear-nose',
  'picture-cake',
  'food-first',
  'crawl-run',
  'long-tail',
  'crow-ship',
  'pheasant-chicken',
  'pheasant-egg',
  'others-cake',
  'sickle-letter',
  'bird-mouse',
  'nose-three',
  'lie-cake',
  'lie-spit',
  'sweet-bitter',
]

for (const slug of SLUGS) {
  const prefix = `proverbs-${slug}`
  for (let i = 1; i <= 6; i += 1) {
    const num = String(i).padStart(2, '0')
    const src = path.join(assetsDir, `${slug}-${num}.png`)
    if (!existsSync(src)) throw new Error(`missing ${src}`)
    const dest = path.join(outDir, `${prefix}-${num}.png`)
    await sharp(src)
      .resize(PANEL_W, PANEL_H, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9 })
      .toFile(dest)
    console.log('wrote', path.basename(dest))
  }
}
