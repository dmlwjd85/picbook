/**
 * public/demo/powers PNG 용량 축소 (모바일 멈춤 완화)
 * 실행: node scripts/compress-powers.mjs
 */
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const dir = path.resolve('public/demo/powers')

const files = (await readdir(dir)).filter((f) => f.endsWith('.png'))

for (const file of files) {
  const input = path.join(dir, file)
  const before = (await stat(input)).size
  const buf = await sharp(input)
    .resize({ width: 1280, withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9, palette: true })
    .toBuffer()
  await sharp(buf).toFile(input)
  const after = (await stat(input)).size
  console.log(`${file}: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`)
}
