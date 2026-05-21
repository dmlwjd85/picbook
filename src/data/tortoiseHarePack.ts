import { getCachedPack } from '../lib/packCache'
import { createId } from '../lib/ids'
import type { ReadingPack, SentenceBlock } from '../types/pack'
import { getPackContentVersion } from './packContentVersions'
import { TORTOISE_HARE_STORY_ID } from './tortoiseHareVisualDictionary'

const BOOK_ID = 'tortoise-and-hare'

function chunkSentence(text: string, closingLine?: string): SentenceBlock {
  const layerId = createId()
  return {
    id: createId(),
    text,
    layers: [
      {
        id: layerId,
        label: '청크 무대',
        zIndex: 1,
        imageUrl: null,
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
    ...(closingLine ? { closingLine } : {}),
  }
}

function buildTortoiseHarePack(): ReadingPack {
  return {
    formatVersion: 1,
    id: BOOK_ID,
    title: '토끼와 거북이',
    description:
      '의미 청크(수어형) 시각 사전 데모 — 타이핑한 단어·어절에 맞춰 PNG가 레이어로 겹쳐집니다.',
    author: 'PicBook',
    typingStyle: 'stacked',
    visualDictionaryStoryId: TORTOISE_HARE_STORY_ID,
    updatedAt: '2026-05-19T12:00:00.000Z',
    sentences: [
      chunkSentence('옛날 숲에 토끼와 거북이가 살고 있었습니다.'),
      chunkSentence('빠른 토끼가 거북이를 놀렸습니다.'),
      chunkSentence('둘이 경주를 하기로 했습니다.'),
      chunkSentence('출발하자 토끼는 빠르게 달려갔습니다.'),
      chunkSentence('자만한 토끼는 나무 그늘에서 잠이 들었습니다.'),
      chunkSentence('거북이는 느리지만 성실하게 기어갔습니다.'),
      chunkSentence('거북이가 먼저 결승선에 도착했습니다.'),
      chunkSentence('토끼는 깜짝 놀라 달렸지만 늦어서 졌습니다.'),
      chunkSentence(
        '꾸준한 이가 이기는 법이라는 교훈을 배웠습니다.',
        '느리지만 꾸준히 가는 이가 결국 이깁니다.',
      ),
    ],
  }
}

export function createTortoiseHarePack(): ReadingPack {
  const version = getPackContentVersion(BOOK_ID)
  return getCachedPack(`${BOOK_ID}@${version}`, buildTortoiseHarePack)
}
