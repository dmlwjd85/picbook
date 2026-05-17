/**
 * 정사각(1:1) 컷을 3:2(1536×1024)로 확장 — 좌·우에 장면을 이어 붙임 (크롭만 하지 않음)
 * 가장자리 픽셀을 반사·블렌드해 숲·하늘 등 배경이 자연스럽게 이어지게 함
 */
import sharp from 'sharp'

/** 배포용 패널 크기 (삼권분립 samgwon과 동일) */
export const PANEL_W = 1536
export const PANEL_H = 1024
const INNER = PANEL_H
const PAD_SIDE = (PANEL_W - INNER) / 2
/** 캐릭터가 섞이지 않도록 가장자리 얇게만 샘플 */
const EDGE_SAMPLE = 56
const SEAM_BLEND = 80

/**
 * @param {Buffer} squareBuf — 정사각 PNG 버퍼
 * @returns {Promise<Buffer>} 1536×1024 PNG
 */
export async function outpaintSquareTo32(squareBuf) {
  const core = await sharp(squareBuf)
    .resize(INNER, INNER, { kernel: sharp.kernel.lanczos3 })
    .toBuffer()

  const stats = await sharp(core).stats()
  const bg = {
    r: Math.round(stats.channels[0].mean),
    g: Math.round(stats.channels[1].mean),
    b: Math.round(stats.channels[2].mean),
  }

  const leftWing = await buildWing(core, 'left')
  const rightWing = await buildWing(core, 'right')
  const leftMask = await seamMask(PAD_SIDE, INNER, 'left')
  const rightMask = await seamMask(PAD_SIDE, INNER, 'right')

  const leftFeathered = await featherWing(leftWing, leftMask)
  const rightFeathered = await featherWing(rightWing, rightMask)

  return sharp({
    create: {
      width: PANEL_W,
      height: PANEL_H,
      channels: 3,
      background: bg,
    },
  })
    .composite([
      { input: leftFeathered, left: 0, top: 0 },
      { input: core, left: PAD_SIDE, top: 0 },
      { input: rightFeathered, left: PANEL_W - PAD_SIDE, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function buildWing(coreBuf, side) {
  const extract =
    side === 'left'
      ? { left: 0, top: 0, width: EDGE_SAMPLE, height: INNER }
      : { left: INNER - EDGE_SAMPLE, top: 0, width: EDGE_SAMPLE, height: INNER }

  let pipe = sharp(coreBuf).extract(extract)
  if (side === 'left') pipe = pipe.flop()
  else pipe = pipe.flip()

  return pipe
    .resize(PAD_SIDE, INNER, { fit: 'fill' })
    .blur(0.9)
    .modulate({ brightness: 1.03, saturation: 0.95 })
    .toBuffer()
}

/** 이음 매끄럽게 — 알파 그라데이션 마스크 */
async function seamMask(width, height, side) {
  const ramp = Buffer.alloc(width * height)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const t = side === 'left' ? x / Math.max(1, width - 1) : 1 - x / Math.max(1, width - 1)
      ramp[y * width + x] = Math.round(Math.min(1, Math.max(0, t)) * 255)
    }
  }
  const seamW = Math.min(SEAM_BLEND, width)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < seamW; x += 1) {
      const idx = y * width + (side === 'left' ? width - seamW + x : x)
      const fade = side === 'left' ? x / seamW : 1 - x / seamW
      ramp[idx] = Math.round(ramp[idx] * fade)
    }
  }
  return sharp(ramp, { raw: { width, height, channels: 1 } }).png().toBuffer()
}

async function featherWing(wingBuf, maskBuf) {
  return sharp(wingBuf)
    .ensureAlpha()
    .composite([{ input: maskBuf, blend: 'dest-in' }])
    .toBuffer()
}
