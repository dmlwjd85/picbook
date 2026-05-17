import { getCachedPack } from '../lib/packCache'
import type { ReadingPack } from '../types/pack'
import { getPackContentVersion } from './packContentVersions'
import { createKindWordsProverbScenes } from './kindWordsProverbSentence'

const BOOK_ID = 'elementary-proverbs'

function buildElementaryProverbsPack(): ReadingPack {
  return {
    formatVersion: 1,
    id: BOOK_ID,
    title: '초등 필수 속담',
    description: '가는 말이 고와야 오는 말이 곱다 — 그림 6컷, 짧은 한글만 따라 씁니다.',
    author: 'PicBook',
    typingStyle: 'minimal',
    updatedAt: '2026-05-17T18:00:00.000Z',
    sentences: createKindWordsProverbScenes(),
  }
}

export function createElementaryProverbsPack(): ReadingPack {
  const version = getPackContentVersion(BOOK_ID)
  return getCachedPack(`${BOOK_ID}@${version}`, buildElementaryProverbsPack)
}
