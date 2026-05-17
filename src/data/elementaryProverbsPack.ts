import { createId } from '../lib/ids'
import { getCachedPack } from '../lib/packCache'
import type { ReadingPack } from '../types/pack'
import { getPackContentVersion } from './packContentVersions'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

const BOOK_ID = 'coming-elementary-proverbs'

/** 출판 전 스텁 팩 — 이미지·문장·큐는 첨부 후 채운다 */
function buildElementaryProverbsPack(): ReadingPack {
  const layer = createId()
  return {
    formatVersion: 1,
    id: BOOK_ID,
    title: '초등 필수 속담',
    description: '초등학생이 꼭 알아야 할 우리 속담을 타이핑하며 익히는 PicBook.',
    author: 'PicBook',
    updatedAt: '2026-05-17T00:00:00.000Z',
    sentences: [
      {
        id: createId(),
        text: '우리 속담은 짧은 말 속에 오래된 지혜를 담아 두었습니다.',
        layers: [
          {
            id: layer,
            label: '표지 연출',
            zIndex: 1,
            imageUrl: PROVERBS_IMAGES.cover,
            visible: true,
            opacity: 1,
            x: 0,
            y: 0,
            width: 100,
            scale: 1,
            fillHeight: true,
          },
        ],
        cues: [],
      },
    ],
  }
}

export function createElementaryProverbsPack(): ReadingPack {
  const version = getPackContentVersion(BOOK_ID)
  return getCachedPack(`${BOOK_ID}@${version}`, buildElementaryProverbsPack)
}
