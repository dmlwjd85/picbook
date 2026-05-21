/**
 * editor-inbox + data/editor-workspace/manifests → public/ 반영
 * 사용: node scripts/sync-editor-workspace.mjs [--book elementary-proverbs]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const inboxRoot = path.join(root, 'editor-inbox')
const manifestDir = path.join(root, 'data', 'editor-workspace', 'manifests')

const bookArg = process.argv.find((a) => a.startsWith('--book='))?.split('=')[1]
  ?? (process.argv.includes('--book') ? process.argv[process.argv.indexOf('--book') + 1] : null)

function loadManifests() {
  const list = []
  if (!fs.existsSync(manifestDir)) return list
  for (const f of fs.readdirSync(manifestDir)) {
    if (!f.endsWith('.json')) continue
    if (bookArg && !f.startsWith(bookArg)) continue
    const data = JSON.parse(fs.readFileSync(path.join(manifestDir, f), 'utf8'))
    list.push(data)
  }
  return list
}

function copyFromInbox(bookId, entry) {
  const inboxPath = path.join(inboxRoot, bookId, entry.inboxFile)
  const altPath = path.join(inboxRoot, bookId, entry.targetPath.replace(/^public\//, '').replace(/\//g, '__'))
  const src = fs.existsSync(inboxPath) ? inboxPath : fs.existsSync(altPath) ? altPath : null
  if (!src) {
    console.warn('  skip (no inbox file):', entry.inboxFile)
    return false
  }
  const dest = path.join(root, entry.targetPath)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  console.log('  OK', entry.targetPath)
  return true
}

function scanInboxFolder(bookId) {
  const dir = path.join(inboxRoot, bookId)
  if (!fs.existsSync(dir)) return []
  const entries = []
  for (const name of fs.readdirSync(dir)) {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(name)) continue
    if (!name.includes('__')) continue
    const targetPath = 'public/' + name.replace(/__/g, '/')
    entries.push({ targetPath, inboxFile: name, updatedAt: new Date().toISOString() })
  }
  return entries
}

let total = 0
const manifests = loadManifests()
const inboxBookIds = fs.existsSync(inboxRoot)
  ? fs.readdirSync(inboxRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  : []
const bookIds = bookArg ? [bookArg] : [...new Set([...manifests.map((m) => m.bookId), ...inboxBookIds])]

for (const bookId of bookIds) {
  const manifest = manifests.find((m) => m.bookId === bookId)
  const assets = manifest?.pendingAssets?.length
    ? manifest.pendingAssets
    : scanInboxFolder(bookId)
  if (assets.length === 0) continue
  console.log(`\n[${bookId}] ${assets.length}개`)
  for (const entry of assets) {
    if (copyFromInbox(bookId, entry)) total += 1
  }
}

if (total === 0) {
  console.log('반영할 inbox 파일이 없습니다. editor-inbox/{bookId}/ 또는 manifests JSON을 확인하세요.')
} else {
  console.log(`\n총 ${total}개 파일을 public에 반영했습니다.`)
}
