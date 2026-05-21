/**
 * visual_dictionary CSV/시드에 있는 file_name 기준 512×512 플레이스홀더 PNG 생성
 * 사용: node scripts/generate-visual-dictionary-placeholders.mjs [csv경로]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultCsv = path.join(root, 'data/visual-dictionary/stories/tortoise_and_hare.csv')
const outRoot = path.join(root, 'public/visual-dictionary')

function folderFromFileName(fileName) {
  const n = fileName.toLowerCase()
  if (n.startsWith('bg_')) return 'backgrounds'
  if (n.startsWith('n_')) return 'nouns'
  if (n.startsWith('v_')) return 'verbs'
  if (n.startsWith('a_')) return 'adjectives'
  if (n.startsWith('e_')) return 'emotions'
  if (n.startsWith('fx_')) return 'effects'
  if (n.startsWith('p_')) return 'particles'
  return 'nouns'
}

function parseRow(line) {
  const cells = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuote = !inQuote
      continue
    }
    if (ch === ',' && !inQuote) {
      cells.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  cells.push(cur.trim())
  return cells
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim())
  const header = parseRow(lines[0])
  const fi = header.indexOf('file_name')
  const wi = header.indexOf('word')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const parts = parseRow(lines[i])
    if (parts.length < 2) continue
    const file_name = (parts[fi] ?? '').trim()
    const word = (parts[wi] ?? '').trim()
    if (file_name.endsWith('.png')) rows.push({ file_name, word })
  }
  return rows
}

function colorForFolder(folder) {
  switch (folder) {
    case 'backgrounds':
      return { r: 34, g: 80, b: 50, a: 255 }
    case 'verbs':
      return { r: 59, g: 130, b: 246, a: 200 }
    case 'adjectives':
      return { r: 234, g: 179, b: 8, a: 200 }
    case 'emotions':
      return { r: 236, g: 72, b: 153, a: 200 }
    case 'effects':
      return { r: 148, g: 163, b: 184, a: 180 }
    default:
      return { r: 251, g: 146, b: 60, a: 220 }
  }
}

async function makePlaceholder(fileName, word, folder) {
  const dir = path.join(outRoot, folder)
  fs.mkdirSync(dir, { recursive: true })
  const outPath = path.join(dir, fileName)
  if (fs.existsSync(outPath)) return false

  const size = 512
  const bg = folder === 'backgrounds' ? colorForFolder(folder) : { r: 0, g: 0, b: 0, a: 0 }
  const accent = colorForFolder(folder)

  const label = (word || fileName).slice(0, 8)
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="rgba(${bg.r},${bg.g},${bg.b},${bg.a / 255})"/>
  <rect x="56" y="200" width="400" height="160" rx="24" fill="rgba(${accent.r},${accent.g},${accent.b},0.85)"/>
  <text x="256" y="295" text-anchor="middle" font-size="42" font-family="sans-serif" fill="#fff" font-weight="bold">${label}</text>
  <text x="256" y="340" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#f8fafc">${fileName}</text>
</svg>`

  await sharp(Buffer.from(svg)).png().toFile(outPath)
  return true
}

const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultCsv
const csv = fs.readFileSync(csvPath, 'utf8')
const rows = parseCsv(csv)
let created = 0
for (const { file_name, word } of rows) {
  const folder = folderFromFileName(file_name)
  if (await makePlaceholder(file_name, word, folder)) created++
}
console.log(`OK: ${created} new placeholders (${rows.length} rows in CSV)`)
