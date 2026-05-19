import type { SentenceBlock } from '../types/pack'

/** 문장 큐에서 layerImage 순서대로 패널 URL 목록 추출 */
export function extractPanelUrlsFromSentence(sentence: SentenceBlock): string[] {
  const seen = new Set<string>()
  const urls: string[] = []

  const sorted = [...sentence.cues].sort((a, b) => a.charIndex - b.charIndex)
  for (const cue of sorted) {
    for (const eff of cue.effects) {
      if (eff.kind === 'layerImage' && eff.imageUrl && !seen.has(eff.imageUrl)) {
        seen.add(eff.imageUrl)
        urls.push(eff.imageUrl)
      }
    }
  }

  if (urls.length === 0) {
    for (const layer of sentence.layers) {
      if (layer.imageUrl && !seen.has(layer.imageUrl)) {
        seen.add(layer.imageUrl)
        urls.push(layer.imageUrl)
      }
    }
  }

  return urls
}
