/**
 * 토끼와 거북이 표지 — 들판 배경 + 캐릭터 합성(투명 PNG 검은 여백 방지)
 * node scripts/make-tortoise-hare-cover.mjs
 */
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, 'public/demo/tortoise-hare-cover.png')
const meadow = path.join(root, 'public/visual-dictionary/backgrounds/bg_meadow_01.png')
const rabbit = path.join(root, 'public/visual-dictionary/nouns/n_rabbit_01.png')
const turtle = path.join(root, 'public/visual-dictionary/nouns/n_turtle_01.png')

const W = 900
const H = 1200
const SKY = { r: 186, g: 230, b: 210 }

async function trimCharacter(src) {
  return sharp(src)
    .ensureAlpha()
    .trim({ threshold: 12 })
    .resize(440, 440, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()
}

const bg = await sharp(meadow)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .modulate({ brightness: 1.06, saturation: 1.08 })
  .blur(0.3)
  .flatten({ background: SKY })
  .toBuffer()

const [turtleBuf, rabbitBuf] = await Promise.all([trimCharacter(turtle), trimCharacter(rabbit)])

const turtleMeta = await sharp(turtleBuf).metadata()
const rabbitMeta = await sharp(rabbitBuf).metadata()

const turtleLeft = Math.round(W * 0.06)
const turtleTop = Math.round(H * 0.52 - (turtleMeta.height ?? 0) / 2)
const rabbitLeft = Math.round(W * 0.48)
const rabbitTop = Math.round(H * 0.38 - (rabbitMeta.height ?? 0) / 2)

await sharp(bg)
  .composite([
    { input: turtleBuf, left: turtleLeft, top: turtleTop },
    { input: rabbitBuf, left: rabbitLeft, top: rabbitTop },
  ])
  .flatten({ background: SKY })
  .png({ compressionLevel: 9 })
  .toFile(out)

console.log('OK', out)
