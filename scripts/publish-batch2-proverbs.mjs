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

/** assets 슬러그 → public/demo/proverbs 접두사 */
const SLUG_MAP = {
  'ear-nose': 'proverbs-earring-nose',
  'picture-cake': 'proverbs-rice-cake-picture',
  'food-first': 'proverbs-diamond-food',
  'crawl-run': 'proverbs-run-before-crawl',
  'long-tail': 'proverbs-long-tail',
  'crow-ship': 'proverbs-crow-fly-belly',
  'pheasant-chicken': 'proverbs-pheasant-chicken',
  'pheasant-egg': 'proverbs-pheasant-egg',
  'others-cake': 'proverbs-others-cake',
  'sickle-letter': 'proverbs-sickle-giyeok',
  'bird-mouse': 'proverbs-day-bird-night-mouse',
  'nose-three': 'proverbs-nose-three-feet',
  'lie-cake': 'proverbs-lie-rice-cake',
  'lie-spit': 'proverbs-lie-spit',
  'sweet-bitter': 'proverbs-sweet-bitter',
}

for (const [slug, prefix] of Object.entries(SLUG_MAP)) {
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
