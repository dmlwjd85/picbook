import { getCachedPack } from '../lib/packCache'
import type { ReadingPack } from '../types/pack'
import { getPackContentVersion } from './packContentVersions'
import { createDrizzleRainProverbSentence } from './drizzleRainProverbSentence'
import { createKindWordsProverbSentence } from './kindWordsProverbSentence'
import { createDungMedicineProverbSentence } from './dungMedicineProverbSentence'
import { createFrogTadpoleProverbSentence } from './frogTadpoleProverbSentence'
import { createLiverGallProverbSentence } from './liverGallProverbSentence'
import { createManyBranchesProverbSentence } from './manyBranchesProverbSentence'
import { createOakPineProverbSentence } from './oakPineProverbSentence'
import { createPersimmonProverbSentence } from './persimmonProverbSentence'
import { createRiverFireProverbSentence } from './riverFireProverbSentence'
import { createTaesanProverbSentence } from './taesanProverbSentence'
import { createWhaleShrimpProverbSentence } from './whaleShrimpProverbSentence'
import { createCatBellProverbSentence } from './catBellProverbSentence'
import { createSteadyTowerProverbSentence } from './steadyTowerProverbSentence'
import { createBeadsPearlProverbSentence } from './beadsPearlProverbSentence'
import { createRollingStoneProverbSentence } from './rollingStoneProverbSentence'
import {
  createCrowFlyBellyProverbSentence,
  createDayBirdNightMouseProverbSentence,
  createDiamondFoodProverbSentence,
  createEarringNoseProverbSentence,
  createLieRiceCakeProverbSentence,
  createLieSpitProverbSentence,
  createLongTailProverbSentence,
  createNoseThreeFeetProverbSentence,
  createOthersCakeProverbSentence,
  createPheasantChickenProverbSentence,
  createPheasantEggProverbSentence,
  createRiceCakePictureProverbSentence,
  createRunBeforeCrawlProverbSentence,
  createSickleGiyeokProverbSentence,
  createSweetBitterProverbSentence,
} from './proverbs16to30Sentences'

const BOOK_ID = 'elementary-proverbs'

function buildElementaryProverbsPack(): ReadingPack {
  return {
    formatVersion: 1,
    id: BOOK_ID,
    title: '초등 필수 속담',
    description:
      '속담 문장을 따라 쓰며 6컷 만화 연출로 익히는 PicBook. 30개 속담 수록.',
    author: 'PicBook',
    typingStyle: 'stacked',
    updatedAt: '2026-05-18T12:00:00.000Z',
    sentences: [
      createKindWordsProverbSentence(),
      createDrizzleRainProverbSentence(),
      createOakPineProverbSentence(),
      createManyBranchesProverbSentence(),
      createLiverGallProverbSentence(),
      createTaesanProverbSentence(),
      createPersimmonProverbSentence(),
      createRiverFireProverbSentence(),
      createFrogTadpoleProverbSentence(),
      createDungMedicineProverbSentence(),
      createWhaleShrimpProverbSentence(),
      createCatBellProverbSentence(),
      createSteadyTowerProverbSentence(),
      createBeadsPearlProverbSentence(),
      createRollingStoneProverbSentence(),
      createEarringNoseProverbSentence(),
      createRiceCakePictureProverbSentence(),
      createDiamondFoodProverbSentence(),
      createRunBeforeCrawlProverbSentence(),
      createLongTailProverbSentence(),
      createCrowFlyBellyProverbSentence(),
      createPheasantChickenProverbSentence(),
      createPheasantEggProverbSentence(),
      createOthersCakeProverbSentence(),
      createSickleGiyeokProverbSentence(),
      createDayBirdNightMouseProverbSentence(),
      createNoseThreeFeetProverbSentence(),
      createLieRiceCakeProverbSentence(),
      createLieSpitProverbSentence(),
      createSweetBitterProverbSentence(),
    ],
  }
}

export function createElementaryProverbsPack(): ReadingPack {
  const version = getPackContentVersion(BOOK_ID)
  return getCachedPack(`${BOOK_ID}@${version}`, buildElementaryProverbsPack)
}
