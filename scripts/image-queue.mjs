/**
 * 이미지 작업 큐 — 버튼 없이 일괄 처리 (assets → public)
 * jobs.json 예: [{ "src": "nation-v1.png", "dest": "public/demo/powers/powers-intro-nation.png" }]
 *
 * node scripts/image-queue.mjs
 * node scripts/image-queue.mjs --watch  (30초마다 재실행)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const queuePath = path.join(root, 'data', 'image-queue', 'jobs.json')
const assetsDir = path.join(process.env.USERPROFILE ?? '', '.cursor', 'projects', 'c-Project', 'assets')
const doneLog = path.join(root, 'data', 'image-queue', 'done.log')

function loadJobs() {
  if (!fs.existsSync(queuePath)) {
    console.log('큐 없음:', queuePath)
    return []
  }
  return JSON.parse(fs.readFileSync(queuePath, 'utf8'))
}

async function processJob(job) {
  const srcPath = path.isAbsolute(job.src) ? job.src : path.join(assetsDir, job.src)
  const destPath = path.join(root, job.dest.replace(/^\/+/, ''))
  if (!fs.existsSync(srcPath)) {
    console.warn('skip (no src):', job.src)
    return false
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  let pipeline = sharp(srcPath)
  if (job.resize === '3x2' || job.dest.includes('proverbs/')) {
    pipeline = pipeline.resize(1536, 1024, { fit: 'cover', position: 'centre' })
  } else if (job.resize === '512') {
    pipeline = pipeline.resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(destPath)
  console.log('OK', job.dest)
  fs.appendFileSync(doneLog, `${new Date().toISOString()} ${job.dest}\n`)
  return true
}

async function runOnce() {
  const jobs = loadJobs()
  let n = 0
  for (const job of jobs) {
    if (await processJob(job)) n += 1
  }
  console.log(`\n처리 ${n}/${jobs.length}`)
  return n
}

const watch = process.argv.includes('--watch')
if (watch) {
  console.log('이미지 큐 감시 중 (30초)… Ctrl+C 종료')
  const loop = async () => {
    await runOnce()
    setTimeout(loop, 30000)
  }
  void loop()
} else {
  void runOnce()
}
