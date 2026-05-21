/**
 * PNG → 512×512 contain(전체 보임), 여백 trim, 비배경은 흰색 알파 제거
 * 사용:
 *   node scripts/process-visual-dictionary-images.mjs <입력폴더>
 *   node scripts/process-visual-dictionary-images.mjs --in-place  (public/visual-dictionary 전체 재처리)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const inPlace = process.argv.includes('--in-place')
const inDir = inPlace
  ? path.join(root, 'public/visual-dictionary')
  : process.argv[2] && !process.argv[2].startsWith('--')
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

async function trimAndFit(inputBuf) {
  let pipeline = sharp(inputBuf)
  try {
    pipeline = pipeline.trim({ threshold: 14 })
  } catch {
    /* trim 실패 시 원본 */
  }

  const { data, info } = await pipeline
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const threshold = 242
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer()
}

function collectFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) collectFiles(p, acc)
    else if (/\.(png|jpg|jpeg|webp)$/i.test(ent.name)) acc.push(p)
  }
  return acc
}

async function main() {
  const files = inPlace ? collectFiles(inDir) : fs.readdirSync(inDir).map((f) => path.join(inDir, f))
  const imageFiles = files.filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
  if (imageFiles.length === 0) {
    console.error('이미지 없음:', inDir)
    process.exit(1)
  }

  for (const filePath of imageFiles) {
    const file = path.basename(filePath)
    const base = file.replace(/\.[^.]+$/, '') + '.png'
    const folder = folderFromFileName(base)
    const outDir = inPlace ? path.dirname(filePath) : path.join(outRoot, folder)
    fs.mkdirSync(outDir, { recursive: true })
    const buf = fs.readFileSync(filePath)
    const out = await trimAndFit(buf)
    const dest = inPlace ? filePath : path.join(outDir, base)
    fs.writeFileSync(dest, out)
    console.log('OK', path.relative(root, dest))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
