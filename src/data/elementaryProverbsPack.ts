import { getCachedPack } from '../lib/packCache'
import type { ReadingPack } from '../types/pack'
import { getPackContentVersion } from './packContentVersions'
import { createKindWordsProverbSentence } from './kindWordsProverbSentence'

const BOOK_ID = 'elementary-proverbs'

function buildElementaryProverbsPack(): ReadingPack {
  return {
    formatVersion: 1,
    id: BOOK_ID,
    title: '초등 필수 속담',
    description:
      '「가는 말이 고와야 오는 말이 곱다」를 6컷 그림과 타이핑으로 익히는 PicBook. 첫 번째 속담 팩.',
    author: 'PicBook',
    updatedAt: '2026-05-17T12:00:00.000Z',
    sentences: [createKindWordsProverbSentence()],
  }
}

export function createElementaryProverbsPack(): ReadingPack {
  const version = getPackContentVersion(BOOK_ID)
  return getCachedPack(`${BOOK_ID}@${version}`, buildElementaryProverbsPack)
}
