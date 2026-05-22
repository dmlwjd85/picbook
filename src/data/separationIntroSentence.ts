import { createId } from '../lib/ids'
import type { Cue, SentenceBlock } from '../types/pack'
import { POWERS_INTRO_IMAGES } from './separationPowersAssets'
import { W3, idxAfter } from './separationPackShared'

const INTRO_TEXT =
  '권력분립은 국가권력을 국회, 행정부, 법원이 나눠 맡도록 헌법으로 정해 놓은 것이다.'

export function createSeparationIntroSentence(): SentenceBlock {
  const layerStage = createId()
  const layerLegis = createId()
  const layerExec = createId()
  const layerJustice = createId()

  const showStage = (imageUrl: string): Cue['effects'] => [
    { kind: 'layerHide', layerId: layerLegis },
    { kind: 'layerHide', layerId: layerExec },
    { kind: 'layerHide', layerId: layerJustice },
    { kind: 'layerShow', layerId: layerStage },
    { kind: 'layerImage', layerId: layerStage, imageUrl },
    {
      kind: 'layerTransform',
      layerId: layerStage,
      x: 0,
      y: 0,
      width: 100,
      scale: 1,
      fillHeight: true,
      panX: 0,
      panY: 0,
    },
    { kind: 'layerOpacity', layerId: layerStage, opacity: 1 },
  ]

  const cues: Cue[] = [
    {
      id: createId(),
      charIndex: idxAfter(INTRO_TEXT, '국회'),
      effects: [
        { kind: 'layerHide', layerId: layerStage },
        { kind: 'layerShow', layerId: layerLegis },
        { kind: 'layerImage', layerId: layerLegis, imageUrl: POWERS_INTRO_IMAGES.assembly },
        {
          kind: 'layerTransform',
          layerId: layerLegis,
          x: 0,
          y: 0,
          width: W3,
          fillHeight: true,
        },
      ],
    },
    {
      id: createId(),
      charIndex: idxAfter(INTRO_TEXT, '행정부'),
      effects: [
        { kind: 'layerShow', layerId: layerExec },
        { kind: 'layerImage', layerId: layerExec, imageUrl: POWERS_INTRO_IMAGES.executive },
        {
          kind: 'layerTransform',
          layerId: layerExec,
          x: W3,
          y: 0,
          width: 33.33,
          fillHeight: true,
        },
      ],
    },
    {
      id: createId(),
      charIndex: idxAfter(INTRO_TEXT, '법원'),
      effects: [
        { kind: 'layerShow', layerId: layerJustice },
        { kind: 'layerImage', layerId: layerJustice, imageUrl: POWERS_INTRO_IMAGES.judiciary },
        {
          kind: 'layerTransform',
          layerId: layerJustice,
          x: 66.67,
          y: 0,
          width: 33.33,
          fillHeight: true,
        },
      ],
    },
    {
      id: createId(),
      charIndex: idxAfter(INTRO_TEXT, '나눠'),
      effects: showStage(POWERS_INTRO_IMAGES.divide),
    },
    {
      id: createId(),
      charIndex: idxAfter(INTRO_TEXT, '헌법'),
      effects: showStage(POWERS_INTRO_IMAGES.constitution),
    },
    {
      id: createId(),
      charIndex: idxAfter(INTRO_TEXT, '정해'),
      effects: showStage(POWERS_INTRO_IMAGES.stamp),
    },
  ]

  return {
    id: createId(),
    text: INTRO_TEXT,
    vocabGlosses: [
      { charIndex: 0, term: '권', definition: '권리와 힘' },
      { charIndex: 2, term: '분', definition: '나누어 세움' },
      { charIndex: 3, term: '립', definition: '탑 세우기' },
    ],
    captions: [
      { charIndex: 0, text: '권력분립 — 국가권력을 나누는 원칙' },
      { charIndex: idxAfter(INTRO_TEXT, '국회'), text: '국회·행정부·법원이 각각 역할을 맡습니다' },
      { charIndex: idxAfter(INTRO_TEXT, '헌법'), text: '헌법이 이를 정합니다' },
    ],
    layers: [
      {
        id: layerStage,
        label: '전체 장면',
        zIndex: 5,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 0,
        y: 0,
        width: 100,
        scale: 1,
        fillHeight: true,
      },
      {
        id: layerLegis,
        label: '국회',
        zIndex: 2,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 0,
        y: 0,
        width: W3,
        scale: 1,
        fillHeight: true,
        plateCaption: '국회',
      },
      {
        id: layerExec,
        label: '행정부',
        zIndex: 2,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: W3,
        y: 0,
        width: 33.33,
        scale: 1,
        fillHeight: true,
        plateCaption: '행정부',
      },
      {
        id: layerJustice,
        label: '법원',
        zIndex: 2,
        imageUrl: null,
        visible: false,
        opacity: 1,
        x: 66.67,
        y: 0,
        width: 33.33,
        scale: 1,
        fillHeight: true,
        plateCaption: '법원',
      },
    ],
    cues,
  }
}
