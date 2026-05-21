import { createId } from '../lib/ids'

import { idxAfter } from './proverbsPackShared'

import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

import { glossAt } from './proverbVocab'

import type { SentenceBlock } from '../types/pack'



export const FROG_TADPOLE_TEXT = '개구리 올챙이 적 생각 못 한다.'



const LAYER_MAIN = 'frog-main'

const LAYER_TADPOLE = 'frog-tadpole-badge'



/** 올챙이 입력 시 연출 위에 올챙이 그림 오버레이 */

export function createFrogTadpoleProverbSentence(): SentenceBlock {

  const images = [

    PROVERBS_IMAGES.frog01,

    PROVERBS_IMAGES.frog02,

    PROVERBS_IMAGES.frog03,

    PROVERBS_IMAGES.frog04,

    PROVERBS_IMAGES.frog05,

    PROVERBS_IMAGES.frog06,

  ] as const



  const showMain = (imageUrl: string) => [

    { kind: 'layerShow' as const, layerId: LAYER_MAIN },

    { kind: 'layerImage' as const, layerId: LAYER_MAIN, imageUrl },

    {

      kind: 'layerTransform' as const,

      layerId: LAYER_MAIN,

      x: 0,

      y: 0,

      width: 100,

      scale: 1,

      fillHeight: true,

      panX: 0,

      panY: 0,

    },

    { kind: 'layerOpacity' as const, layerId: LAYER_MAIN, opacity: 1 },

  ]



  const showTadpoleBadge = [

    { kind: 'layerShow' as const, layerId: LAYER_TADPOLE },

    { kind: 'layerImage' as const, layerId: LAYER_TADPOLE, imageUrl: PROVERBS_IMAGES.frogTadpoleFlash },

    {

      kind: 'layerTransform' as const,

      layerId: LAYER_TADPOLE,

      x: 62,

      y: 58,

      width: 34,

      scale: 1,

      fillHeight: false,

    },

    { kind: 'layerOpacity' as const, layerId: LAYER_TADPOLE, opacity: 1 },

  ]



  const needles = ['개구리', '올챙이', '적', '생각', '한다'] as const



  return {

    id: createId(),

    text: FROG_TADPOLE_TEXT,

    layers: [

      {

        id: LAYER_MAIN,

        label: '속담 장면',

        zIndex: 1,

        imageUrl: images[0],

        visible: true,

        opacity: 1,

        x: 0,

        y: 0,

        width: 100,

        scale: 1,

        fillHeight: true,

      },

      {

        id: LAYER_TADPOLE,

        label: '올챙이',

        zIndex: 4,

        imageUrl: PROVERBS_IMAGES.frogTadpoleFlash,

        visible: false,

        opacity: 0,

        x: 62,

        y: 58,

        width: 34,

        scale: 1,

        fillHeight: false,

      },

    ],

    cues: [

      { id: createId(), charIndex: 0, effects: showMain(images[0]) },

      {

        id: createId(),

        charIndex: idxAfter(FROG_TADPOLE_TEXT, '올챙이'),

        effects: [...showMain(images[1]), ...showTadpoleBadge],

      },

      ...needles.slice(2).map((needle, i) => ({

        id: createId(),

        charIndex: idxAfter(FROG_TADPOLE_TEXT, needle),

        effects: showMain(images[i + 3]),

      })),

    ],

    closingLine: '잘나가면 예전을 잊고 거만해지기 쉬워요.',

    vocabGlosses: [

      glossAt(FROG_TADPOLE_TEXT, '올챙이', {

        term: '올챙이',

        definition: '개구리 새끼, 꼬리가 있는 물속 생물',

      }),

      glossAt(FROG_TADPOLE_TEXT, '적', { term: '적', definition: '어렸을 때, 예전' }),

    ],

  }

}


