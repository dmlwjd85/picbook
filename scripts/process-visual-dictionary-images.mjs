/**
 * 생성된 PNG → 512×512, 비배경 에셋은 흰 배경을 알파로 변환
 * 사용: node scripts/process-visual-dictionary-images.mjs <입력폴더>
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const inDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, 'scripts/_gen_vdict')
const outRoot = path.join(root, 'public/visual-dictionary')

function folderFromFileName(fileName) {
  const n = fileName.toLowerCase()
  if (n.startsWith('bg_')) return 'backgrounds'
  if (n.startsWith('n_')) return 'nouns'
  if (n.startsWith('v_')) return 'verbs'
  if (n.startsWith('a_')) return 'adjectives'
  if (n.startsWith('e_')) return 'emotions'
  if (n.startsWith('fx_')) return 'effects'
  return 'nouns'
}

async function knockWhiteAlpha(inputBuf, isBackground) {
  const { data, info } = await sharp(inputBuf)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const threshold = isBackground ? 250 : 238
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = isBackground ? 255 : 0
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer()
}

async function main() {
  if (!fs.existsSync(inDir)) {
    console.error('입력 폴더 없음:', inDir)
    process.exit(1)
  }
  const files = fs.readdirSync(inDir).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
  if (files.length === 0) {
    console.error('이미지 파일 없음:', inDir)
    process.exit(1)
  }

  for (const file of files) {
    const base = file.replace(/\.[^.]+$/, '') + '.png'
    const folder = folderFromFileName(base)
    const outDir = path.join(outRoot, folder)
    fs.mkdirSync(outDir, { recursive: true })
    const buf = fs.readFileSync(path.join(inDir, file))
    const isBg = folder === 'backgrounds'
    const out = await knockWhiteAlpha(buf, isBg)
    const dest = path.join(outDir, base)
    fs.writeFileSync(dest, out)
    console.log('OK', path.join(folder, base))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
