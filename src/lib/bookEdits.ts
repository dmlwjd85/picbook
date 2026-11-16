import type { PanelSentence } from '../types/customPicbook'
import type { ReadingPack, SentenceBlock } from '../types/pack'
import { createPanelSentenceBlock } from './autoPanelSentence'

/**
 * 기본 제공 픽북(코드에 들어 있는 팩)에 관리자가 덧씌운 수정.
 * 원본은 그대로 두고, 고친 문장만 문장 번호(0부터)로 기록한다 — 지우면 원래대로 돌아간다.
 */
export type BookEdit = {
  /** 그림 문장으로 고친 문장: 문장·그림·등장 위치 전체를 대체 */
  panels: Record<number, PanelSentence>
  /** 여러 겹 연출 문장: 따라 쓸 문장만 대체 */
  texts: Record<number, string>
  /** 검수를 마친 문장 표시 — 기본 제공 픽북은 문장 번호, 직접 만든 픽북은 문장 id */
  reviewed?: string[]
  updatedAt: string
}

export function emptyBookEdit(): BookEdit {
  return { panels: {}, texts: {}, updatedAt: '' }
}

/** 내용 수정이 없는지(검수 표시는 내용이 아니다) */
export function isBookEditEmpty(edit: BookEdit | undefined): boolean {
  return !edit || (Object.keys(edit.panels).length === 0 && Object.keys(edit.texts).length === 0)
}

/**
 * 기존 문장 블록을 편집창이 다루는 그림 문장 꼴로 바꾼다.
 * 그림 1겹이 차례로 바뀌는 문장(속담 6컷 등)만 가능하고,
 * 여러 겹을 겹치거나 시각 사전으로 그리는 문장은 null — 문장만 고칠 수 있다.
 */
export function sentenceBlockToPanel(block: SentenceBlock, id: string): PanelSentence | null {
  if (block.layers.length !== 1) return null
  const layer = block.layers[0]
  const steps: { charIndex: number; imageUrl: string }[] = []
  for (const cue of [...block.cues].sort((a, b) => a.charIndex - b.charIndex)) {
    for (const eff of cue.effects) {
      if (eff.kind === 'layerHide') return null
      if (eff.kind !== 'layerImage' || eff.layerId !== layer.id) continue
      if (steps.length > 0 && steps[steps.length - 1].imageUrl === eff.imageUrl) continue
      steps.push({ charIndex: cue.charIndex, imageUrl: eff.imageUrl })
    }
  }
  if (steps.length === 0 || steps[0].charIndex > 0) {
    if (!layer.imageUrl) return null
    if (steps[0]?.imageUrl !== layer.imageUrl) steps.unshift({ charIndex: 0, imageUrl: layer.imageUrl })
  }
  steps[0].charIndex = 0
  return {
    id,
    text: block.text,
    images: steps.map((s) => s.imageUrl),
    cueIndexes: steps.map((s) => s.charIndex),
    ...(block.closingLine ? { closingLine: block.closingLine } : {}),
  }
}

/** 팩에 관리자 수정을 덧씌운다. 문장 id는 유지해 기존 타임라인·기록과 이어지게 한다. */
export function applyBookEdit(pack: ReadingPack, edit: BookEdit | undefined): ReadingPack {
  if (isBookEditEmpty(edit)) return pack
  const sentences = pack.sentences.map((s, i) => {
    const panel = edit!.panels[i]
    if (panel && panel.text.trim() && panel.images.length > 0) {
      const block = createPanelSentenceBlock(panel)
      // 낱말 풀이는 원문 글자 위치 기준이라 문장이 그대로일 때만 살린다
      const keepGloss = panel.text === s.text && s.vocabGlosses?.length
      return { ...block, id: s.id, ...(keepGloss ? { vocabGlosses: s.vocabGlosses } : {}) }
    }
    const text = edit!.texts[i]?.trim()
    return text ? { ...s, text } : s
  })
  return { ...pack, sentences }
}
