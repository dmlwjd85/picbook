import type { ReadingPack } from '../types/pack'
import { createSeparationIntroSentence } from './separationIntroSentence'
import { createSeparationMainSentence } from './separationMainSentence'
import { createSeparationOutroSentence } from './separationOutroSentence'
import { W } from './separationPackShared'

export const SEPARATION_DEMO_VISUAL_MILESTONES = [0, W(6), W(25), W(39), W(48)] as const

export function createSeparationThreePowersDemoPack(): ReadingPack {
  return {
    formatVersion: 1,
    id: 'demo-separation-three-powers',
    title: '삼권분립',
    description:
      '권력분립의 헌법적 의미부터 삼권 견제·균형, 국민의 자유와 권리 보장까지 타이핑에 맞춰 이어지는 PicBook.',
    author: 'PicBook',
    updatedAt: new Date().toISOString(),
    sentences: [
      createSeparationIntroSentence(),
      createSeparationMainSentence(),
      createSeparationOutroSentence(),
    ],
  }
}
