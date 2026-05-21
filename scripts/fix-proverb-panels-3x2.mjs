/**
 * 속담 12·16·21·29번(1-based) 패널 — 1536×1024(3:2)로 통일
 * node scripts/fix-proverb-panels-3x2.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { PANEL_H, PANEL_W } from './outpaint-panel-3x2.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'public', 'demo', 'proverbs')

const SLUGS = ['cat-bell', 'earring-nose', 'crow-fly-belly', 'lie-spit']
const FORCE = process.argv.includes('--force')

async function fixFile(filePath) {
  const meta = await sharp(filePath).metadata()
  const ratio = meta.width / meta.height
  const targetRatio = 3 / 2
  if (
    !FORCE &&
    Math.abs(ratio - targetRatio) < 0.02 &&
    meta.width >= 1200 &&
    meta.height >= 800
  ) {
    console.log('  skip (ok):', path.basename(filePath), `${meta.width}x${meta.height}`)
    return
  }
  await sharp(filePath)
    .resize(PANEL_W, PANEL_H, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(filePath + '.tmp')
  fs.renameSync(filePath + '.tmp', filePath)
  console.log('  fixed:', path.basename(filePath), `${meta.width}x${meta.height} → ${PANEL_W}x${PANEL_H}`)
}

for (const slug of SLUGS) {
  console.log(`\n${slug}`)
  for (let i = 1; i <= 6; i++) {
    const name = `proverbs-${slug}-${String(i).padStart(2, '0')}.png`
    const fp = path.join(dir, name)
    if (!fs.existsSync(fp)) {
      console.warn('  missing:', name)
      continue
    }
    await fixFile(fp)
  }
}

console.log('\nDone. Run: npm run verify:proverbs')
