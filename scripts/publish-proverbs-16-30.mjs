/** 16~30번 속담 패널 배포 */
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
  'earring-nose',
  'rice-cake-picture',
  'diamond-food',
  'run-before-crawl',
  'long-tail',
  'crow-fly-belly',
  'pheasant-chicken',
  'pheasant-egg',
  'others-cake',
  'sickle-giyeok',
  'day-bird-night-mouse',
  'nose-three-feet',
  'lie-rice-cake',
  'lie-spit',
  'sweet-bitter',
]

for (const slug of SLUGS) {
  const prefix = `proverbs-${slug}`
  for (let i = 1; i <= 6; i += 1) {
    const num = String(i).padStart(2, '0')
    const src = path.join(assetsDir, `${slug}-${num}.png`)
    if (!existsSync(src)) throw new Error(`missing ${src}`)
    await sharp(src)
      .resize(PANEL_W, PANEL_H, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, `${prefix}-${num}.png`))
    console.log('wrote', `${prefix}-${num}.png`)
  }
}
