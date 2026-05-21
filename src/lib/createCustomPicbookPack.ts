import { getPackContentVersion } from '../data/packContentVersions'
import { createId } from './ids'
import type { CustomPicbookRecord } from '../types/customPicbook'
import type { ReadingPack, SentenceBlock } from '../types/pack'

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

/** 커스텀 픽북 메타 → 청크 연출용 ReadingPack */
export function createCustomPicbookPack(meta: CustomPicbookRecord): ReadingPack {
  const texts = meta.sentences.map((t) => t.trim()).filter(Boolean)
  return {
    formatVersion: 1,
    id: meta.id,
    title: meta.title,
    description: meta.blurb,
    author: meta.author,
    typingStyle: 'stacked',
    visualDictionaryStoryId: meta.id,
    contentVersion: getPackContentVersion(meta.id),
    updatedAt: meta.updatedAt,
    sentences: texts.length > 0 ? texts.map((t) => chunkSentence(t)) : [chunkSentence('문장을 추가해 주세요.')],
  }
}
