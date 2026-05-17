import { getCachedPack } from '../lib/packCache'
import type { ReadingPack } from '../types/pack'
import { getPackContentVersion } from './packContentVersions'
import { createDrizzleRainProverbSentence } from './drizzleRainProverbSentence'
import { createKindWordsProverbSentence } from './kindWordsProverbSentence'

const BOOK_ID = 'elementary-proverbs'

function buildElementaryProverbsPack(): ReadingPack {
  return {
    formatVersion: 1,
    id: BOOK_ID,
    title: '초등 필수 속담',
    description:
      '속담 문장을 따라 쓰며 6컷 만화 연출로 익히는 PicBook. 가는 말·가랑비 속담 수록.',
    author: 'PicBook',
    updatedAt: '2026-05-17T22:00:00.000Z',
    sentences: [createKindWordsProverbSentence(), createDrizzleRainProverbSentence()],
  }
}

export function createElementaryProverbsPack(): ReadingPack {
  const version = getPackContentVersion(BOOK_ID)
  return getCachedPack(`${BOOK_ID}@${version}`, buildElementaryProverbsPack)
}
