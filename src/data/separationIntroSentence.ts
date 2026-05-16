import { createId } from '../lib/ids'
import type { Cue, SentenceBlock } from '../types/pack'
import { SLIDE_URLS, W3, idxAfter } from './separationPackShared'

const INTRO_TEXT =
  '권력분립은 국가권력을 국회, 행정부, 법원이 나눠 맡도록 헌법으로 정해 놓은 것이다.'

export function createSeparationIntroSentence(): SentenceBlock {
  const layerBackdrop = createId()
  const layerLegis = createId()
  const layerExec = createId()
  const layerJustice = createId()

  const urlWide = SLIDE_URLS[0]!
  const urlLegis = SLIDE_URLS[1]!
  const urlExec = SLIDE_URLS[2]!
  const urlJustice = SLIDE_URLS[3]!
  const urlConstitution = SLIDE_URLS[5]!

  const cues: Cue[] = [
    {
      id: createId(),
      charIndex: 0,
      effects: [
        { kind: 'layerShow', layerId: layerBackdrop },
        { kind: 'layerImage', layerId: layerBackdrop, imageUrl: urlWide },
        { kind: 'layerOpacity', layerId: layerBackdrop, opacity: 0.92 },
      ],
    },
    {
      id: createId(),
      charIndex: idxAfter(INTRO_TEXT, '국회'),
      effects: [
        { kind: 'layerShow', layerId: layerLegis },
        { kind: 'layerImage', layerId: layerLegis, imageUrl: urlLegis },
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
        { kind: 'layerImage', layerId: layerExec, imageUrl: urlExec },
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
        { kind: 'layerImage', layerId: layerJustice, imageUrl: urlJustice },
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
      charIndex: idxAfter(INTRO_TEXT, '헌법'),
      effects: [
        { kind: 'layerImage', layerId: layerBackdrop, imageUrl: urlConstitution },
        { kind: 'layerOpacity', layerId: layerBackdrop, opacity: 0.28 },
        {
          kind: 'layerTransform',
          layerId: layerLegis,
          scale: 1.05,
          panY: -4,
        },
        {
          kind: 'layerTransform',
          layerId: layerExec,
          scale: 1.05,
          panY: -4,
        },
        {
          kind: 'layerTransform',
          layerId: layerJustice,
          scale: 1.05,
          panY: -4,
        },
      ],
    },
  ]

  return {
    id: createId(),
    text: INTRO_TEXT,
    captions: [
      { charIndex: 0, text: '국가권력은 한곳에 몰리지 않게 나뉩니다' },
      { charIndex: idxAfter(INTRO_TEXT, '헌법'), text: '헌법이 세 기관의 역할을 정합니다' },
    ],
    layers: [
      {
        id: layerBackdrop,
        label: '헌법·전경',
        zIndex: 0,
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
