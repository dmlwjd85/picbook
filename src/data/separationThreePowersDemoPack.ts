import type { ReadingPack } from '../types/pack'
import { getCachedPack } from '../lib/packCache'
import { getPackContentVersion } from './packContentVersions'
import { createSeparationIntroSentence } from './separationIntroSentence'
import { createSeparationMainSentence } from './separationMainSentence'
import { createSeparationOutroSentence } from './separationOutroSentence'
import { W } from './separationPackShared'
import { SEPARATION_STORY_ID } from './separationChunkVisualDictionary'

export const SEPARATION_DEMO_VISUAL_MILESTONES = [0, W(6), W(25), W(39), W(48)] as const

const BOOK_ID = 'demo-separation-three-powers'

function buildSeparationThreePowersDemoPack(): ReadingPack {
  return {
    formatVersion: 1,
    id: BOOK_ID,
    title: '삼권분립',
    description:
      '권력분립의 헌법적 의미부터 삼권 견제·균형, 국민의 자유와 권리 보장까지 타이핑에 맞춰 이어지는 PicBook.',
    author: 'PicBook',
    typingStyle: 'stacked',
    visualDictionaryStoryId: SEPARATION_STORY_ID,
    updatedAt: '2026-05-22T10:00:00.000Z',
    sentences: [
      createSeparationIntroSentence(),
      createSeparationMainSentence(),
      createSeparationOutroSentence(),
    ],
  }
}

export function createSeparationThreePowersDemoPack(): ReadingPack {
  const version = getPackContentVersion(BOOK_ID)
  return getCachedPack(`${BOOK_ID}@${version}`, buildSeparationThreePowersDemoPack)
}
