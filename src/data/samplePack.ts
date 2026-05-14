import { createId } from '../lib/ids'
import type { ReadingPack } from '../types/pack'

/** 체험용 샘플 팩 — 단어 호환·장면 전환을 큐로 흉내 냄 */
export function createSamplePack(): ReadingPack {
  const bgId = createId()
  const cardId = createId()
  const text =
    '바람이 불면 구름이 움직인다.'

  return {
    formatVersion: 1,
    id: 'sample-wind-cloud',
    title: '샘플: 바람과 구름',
    description: '타이핑 글자 수에 맞춰 배경과 카드 이미지가 순서대로 나타납니다.',
    author: 'PicBook',
    updatedAt: new Date().toISOString(),
    sentences: [
      {
        id: createId(),
        text,
        layers: [
          {
            id: bgId,
            label: '배경',
            zIndex: 0,
            imageUrl: null,
            visible: false,
            opacity: 1,
            x: 0,
            y: 0,
            width: 100,
            scale: 1,
          },
          {
            id: cardId,
            label: '단어 카드',
            zIndex: 1,
            imageUrl: null,
            visible: false,
            opacity: 0,
            x: 52,
            y: 38,
            width: 42,
            scale: 0.92,
          },
        ],
        cues: [
          {
            id: createId(),
            charIndex: 0,
            effects: [
              {
                kind: 'layerImage',
                layerId: bgId,
                imageUrl:
                  'https://images.unsplash.com/photo-1504608524841-42fe6f032042?w=1200&q=80&auto=format&fit=crop',
              },
              { kind: 'layerShow', layerId: bgId },
            ],
          },
          {
            id: createId(),
            charIndex: 6,
            effects: [
              {
                kind: 'layerImage',
                layerId: cardId,
                imageUrl:
                  'https://images.unsplash.com/photo-1534088568585-a7f0b94988db?w=800&q=80&auto=format&fit=crop',
              },
              { kind: 'layerShow', layerId: cardId },
              { kind: 'layerOpacity', layerId: cardId, opacity: 0.35 },
            ],
          },
          {
            id: createId(),
            charIndex: 12,
            effects: [
              { kind: 'layerOpacity', layerId: cardId, opacity: 1 },
              { kind: 'layerTransform', layerId: cardId, x: 48, y: 32, width: 48, scale: 1 },
            ],
          },
          {
            id: createId(),
            charIndex: Math.max(0, text.length - 2),
            effects: [{ kind: 'layerTransform', layerId: bgId, scale: 1.04 }],
          },
        ],
      },
    ],
  }
}
