import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createSamplePack } from '../data/samplePack'
import { createId } from '../lib/ids'
import type { Cue, CueEffect, LayerState, ReadingPack, SentenceBlock } from '../types/pack'

const STORAGE_KEY = 'picbook.editor.pack.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function defaultLayer(): LayerState {
  return {
    id: createId(),
    label: '새 레이어',
    zIndex: 1,
    imageUrl: null,
    visible: false,
    opacity: 1,
    x: 8,
    y: 12,
    width: 36,
    scale: 1,
    panX: 0,
    panY: 0,
    fillHeight: false,
    plateCaption: null,
    anchorLabels: null,
  }
}

function defaultSentence(): SentenceBlock {
  return {
    id: createId(),
    text: '여기에 연습할 문장을 입력하세요.',
    layers: [defaultLayer()],
    cues: [],
  }
}

function bumpPackMeta(pack: ReadingPack): ReadingPack {
  return { ...pack, updatedAt: nowIso() }
}

type EditorStore = {
  pack: ReadingPack
  /** 편집 중인 문장 인덱스 */
  activeSentenceIndex: number
  setActiveSentenceIndex: (i: number) => void
  replacePack: (pack: ReadingPack) => void
  resetToSample: () => void
  updateMeta: (patch: Partial<Pick<ReadingPack, 'title' | 'description' | 'author'>>) => void
  addSentence: () => void
  removeSentence: (sentenceId: string) => void
  updateSentenceText: (sentenceId: string, text: string) => void
  addLayer: (sentenceId: string) => void
  updateLayer: (sentenceId: string, layerId: string, patch: Partial<LayerState>) => void
  removeLayer: (sentenceId: string, layerId: string) => void
  addCue: (sentenceId: string, charIndex: number) => void
  updateCue: (sentenceId: string, cueId: string, patch: Partial<Pick<Cue, 'charIndex'>>) => void
  removeCue: (sentenceId: string, cueId: string) => void
  setCueEffects: (sentenceId: string, cueId: string, effects: CueEffect[]) => void
  appendCueEffect: (sentenceId: string, cueId: string, effect: CueEffect) => void
  removeCueEffect: (sentenceId: string, cueId: string, effectIndex: number) => void
  exportJsonString: () => string
}

function mapSentence(
  pack: ReadingPack,
  sentenceId: string,
  fn: (s: SentenceBlock) => SentenceBlock,
): ReadingPack {
  return bumpPackMeta({
    ...pack,
    sentences: pack.sentences.map((s) => (s.id === sentenceId ? fn(s) : s)),
  })
}

export const usePackEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      pack: createSamplePack(),
      activeSentenceIndex: 0,

      setActiveSentenceIndex: (i) => set({ activeSentenceIndex: i }),

      replacePack: (pack) =>
        set({
          pack: { ...pack, formatVersion: 1, updatedAt: pack.updatedAt ?? nowIso() },
          activeSentenceIndex: 0,
        }),

      resetToSample: () => set({ pack: createSamplePack(), activeSentenceIndex: 0 }),

      updateMeta: (patch) =>
        set((s) => ({
          pack: bumpPackMeta({ ...s.pack, ...patch }),
        })),

      addSentence: () =>
        set((s) => ({
          pack: bumpPackMeta({
            ...s.pack,
            sentences: [...s.pack.sentences, defaultSentence()],
          }),
          activeSentenceIndex: s.pack.sentences.length,
        })),

      removeSentence: (sentenceId) =>
        set((s) => {
          const sentences = s.pack.sentences.filter((x) => x.id !== sentenceId)
          const next = sentences.length > 0 ? sentences : [defaultSentence()]
          const idx = Math.min(s.activeSentenceIndex, next.length - 1)
          return { pack: bumpPackMeta({ ...s.pack, sentences: next }), activeSentenceIndex: idx }
        }),

      updateSentenceText: (sentenceId, text) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({ ...sent, text })),
        })),

      addLayer: (sentenceId) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({
            ...sent,
            layers: [...sent.layers, defaultLayer()],
          })),
        })),

      updateLayer: (sentenceId, layerId, patch) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({
            ...sent,
            layers: sent.layers.map((l) => (l.id === layerId ? { ...l, ...patch } : l)),
          })),
        })),

      removeLayer: (sentenceId, layerId) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => {
            if (sent.layers.length <= 1) return sent
            return {
              ...sent,
              layers: sent.layers.filter((l) => l.id !== layerId),
              cues: sent.cues.map((c) => ({
                ...c,
                effects: c.effects.filter((e) => 'layerId' in e && e.layerId !== layerId),
              })),
            }
          }),
        })),

      addCue: (sentenceId, charIndex) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({
            ...sent,
            cues: [...sent.cues, { id: createId(), charIndex, effects: [] }],
          })),
        })),

      updateCue: (sentenceId, cueId, patch) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({
            ...sent,
            cues: sent.cues.map((c) => (c.id === cueId ? { ...c, ...patch } : c)),
          })),
        })),

      removeCue: (sentenceId, cueId) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({
            ...sent,
            cues: sent.cues.filter((c) => c.id !== cueId),
          })),
        })),

      setCueEffects: (sentenceId, cueId, effects) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({
            ...sent,
            cues: sent.cues.map((c) => (c.id === cueId ? { ...c, effects } : c)),
          })),
        })),

      appendCueEffect: (sentenceId, cueId, effect) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({
            ...sent,
            cues: sent.cues.map((c) =>
              c.id === cueId ? { ...c, effects: [...c.effects, effect] } : c,
            ),
          })),
        })),

      removeCueEffect: (sentenceId, cueId, effectIndex) =>
        set((s) => ({
          pack: mapSentence(s.pack, sentenceId, (sent) => ({
            ...sent,
            cues: sent.cues.map((c) =>
              c.id === cueId
                ? { ...c, effects: c.effects.filter((_, i) => i !== effectIndex) }
                : c,
            ),
          })),
        })),

      exportJsonString: () => JSON.stringify(get().pack, null, 2),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ pack: s.pack, activeSentenceIndex: s.activeSentenceIndex }),
    },
  ),
)
