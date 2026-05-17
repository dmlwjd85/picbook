/**
 * 속담 패널 PNG 용량 축소 (1536×1024 유지, 팔레트 압축)
 * 실행: node scripts/compress-proverbs-panels.mjs
 */
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const dir = path.resolve('public/demo/proverbs')
const files = (await readdir(dir)).filter(
  (f) => f.startsWith('proverbs-') && f.endsWith('.png') && !f.includes('cover'),
)

for (const file of files) {
  const input = path.join(dir, file)
  const before = (await stat(input)).size
  const buf = await sharp(input)
    .png({ quality: 82, compressionLevel: 9, palette: true, effort: 10 })
    .toBuffer()
  await sharp(buf).toFile(input)
  const after = (await stat(input)).size
  console.log(`${file}: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`)
}
