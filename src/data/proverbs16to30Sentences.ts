import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
import { glossAt } from './proverbVocab'

export const EARRING_NOSE_TEXT = '귀에 걸면 귀걸이 코에 걸면 코걸이.'
export const RICE_CAKE_PICTURE_TEXT = '그림의 떡.'
export const DIAMOND_FOOD_TEXT = '금강산도 식후경.'
export const RUN_BEFORE_CRAWL_TEXT = '기지도 못하면서 뛰려고 한다.'
export const LONG_TAIL_TEXT = '꼬리가 길면 밟힌다.'
export const CROW_FLY_BELLY_TEXT = '까마귀 날자 배 떨어진다.'
export const PHEASANT_CHICKEN_TEXT = '꿩 대신 닭.'
export const PHEASANT_EGG_TEXT = '꿩 먹고 알 먹는다.'
export const OTHERS_CAKE_TEXT = '남의 떡이 더 커 보인다.'
export const SICKLE_GIYEOK_TEXT = '낫 놓고 기역 자도 모른다.'
export const DAY_BIRD_NIGHT_MOUSE_TEXT = '낮말은 새가 듣고 밤말은 쥐가 듣는다.'
export const NOSE_THREE_FEET_TEXT = '내 코가 석 자.'
export const LIE_RICE_CAKE_TEXT = '누워서 떡 먹기.'
export const LIE_SPIT_TEXT = '누워서 침 뱉기.'
export const SWEET_BITTER_TEXT = '달면 삼키고 쓰면 뱉는다.'

export function createEarringNoseProverbSentence() {
  return createSixPanelProverbSentence(
    EARRING_NOSE_TEXT,
    [
      PROVERBS_IMAGES.earringNose01,
      PROVERBS_IMAGES.earringNose02,
      PROVERBS_IMAGES.earringNose03,
      PROVERBS_IMAGES.earringNose04,
      PROVERBS_IMAGES.earringNose05,
      PROVERBS_IMAGES.earringNose06,
    ],
    ['걸면', '귀걸이', '코에', '코걸이', '.'],
    undefined,
    '같은 사실도 자기에게 유리하게만 해석하기 쉬워요.',
  )
}

export function createRiceCakePictureProverbSentence() {
  return createSixPanelProverbSentence(
    RICE_CAKE_PICTURE_TEXT,
    [
      PROVERBS_IMAGES.riceCakePicture01,
      PROVERBS_IMAGES.riceCakePicture02,
      PROVERBS_IMAGES.riceCakePicture03,
      PROVERBS_IMAGES.riceCakePicture04,
      PROVERBS_IMAGES.riceCakePicture05,
      PROVERBS_IMAGES.riceCakePicture06,
    ],
    ['그', '림', '의', '떡', '.'],
    undefined,
    '그림으로만 보면 먹을 수 없어요. 갖고 싶어도 손에 안 잡혀요.',
  )
}

export function createDiamondFoodProverbSentence() {
  return createSixPanelProverbSentence(
    DIAMOND_FOOD_TEXT,
    [
      PROVERBS_IMAGES.diamondFood01,
      PROVERBS_IMAGES.diamondFood02,
      PROVERBS_IMAGES.diamondFood03,
      PROVERBS_IMAGES.diamondFood04,
      PROVERBS_IMAGES.diamondFood05,
      PROVERBS_IMAGES.diamondFood06,
    ],
    ['금강산', '도', '식후', '경', '.'],
    undefined,
    '아무리 좋은 구경도 배가 부른 뒤에야 즐거워요.',
    [glossAt(DIAMOND_FOOD_TEXT, '식후경', { term: '식후경', definition: '밥 먹고 나서 보는 경치' })],
  )
}

export function createRunBeforeCrawlProverbSentence() {
  return createSixPanelProverbSentence(
    RUN_BEFORE_CRAWL_TEXT,
    [
      PROVERBS_IMAGES.runBeforeCrawl01,
      PROVERBS_IMAGES.runBeforeCrawl02,
      PROVERBS_IMAGES.runBeforeCrawl03,
      PROVERBS_IMAGES.runBeforeCrawl04,
      PROVERBS_IMAGES.runBeforeCrawl05,
      PROVERBS_IMAGES.runBeforeCrawl06,
    ],
    ['못하면', '서', '뛰려', '고', '한다'],
    undefined,
    '기초도 없이 어려운 것부터 하면 잘 안 돼요.',
  )
}

export function createLongTailProverbSentence() {
  return createSixPanelProverbSentence(
    LONG_TAIL_TEXT,
    [
      PROVERBS_IMAGES.longTail01,
      PROVERBS_IMAGES.longTail02,
      PROVERBS_IMAGES.longTail03,
      PROVERBS_IMAGES.longTail04,
      PROVERBS_IMAGES.longTail05,
      PROVERBS_IMAGES.longTail06,
    ],
    ['꼬리', '가', '길면', '밟', '힌다'],
    undefined,
    '나쁜 일을 오래 하면 결국 들통나요.',
  )
}

export function createCrowFlyBellyProverbSentence() {
  return createSixPanelProverbSentence(
    CROW_FLY_BELLY_TEXT,
    [
      PROVERBS_IMAGES.crowFlyBelly01,
      PROVERBS_IMAGES.crowFlyBelly02,
      PROVERBS_IMAGES.crowFlyBelly03,
      PROVERBS_IMAGES.crowFlyBelly04,
      PROVERBS_IMAGES.crowFlyBelly05,
      PROVERBS_IMAGES.crowFlyBelly06,
    ],
    ['까마귀', '날자', '배', '떨어진다', '다'],
    undefined,
    '관계없는 일이 겹치면 억울하게 의심받을 수 있어요.',
  )
}

export function createPheasantChickenProverbSentence() {
  return createSixPanelProverbSentence(
    PHEASANT_CHICKEN_TEXT,
    [
      PROVERBS_IMAGES.pheasantChicken01,
      PROVERBS_IMAGES.pheasantChicken02,
      PROVERBS_IMAGES.pheasantChicken03,
      PROVERBS_IMAGES.pheasantChicken04,
      PROVERBS_IMAGES.pheasantChicken05,
      PROVERBS_IMAGES.pheasantChicken06,
    ],
    ['꿩', '대', '신', '닭', '.'],
    undefined,
    '딱 맞는 게 없을 땐 비슷한 것으로 대신해요.',
  )
}

export function createPheasantEggProverbSentence() {
  return createSixPanelProverbSentence(
    PHEASANT_EGG_TEXT,
    [
      PROVERBS_IMAGES.pheasantEgg01,
      PROVERBS_IMAGES.pheasantEgg02,
      PROVERBS_IMAGES.pheasantEgg03,
      PROVERBS_IMAGES.pheasantEgg04,
      PROVERBS_IMAGES.pheasantEgg05,
      PROVERBS_IMAGES.pheasantEgg06,
    ],
    ['꿩', '먹고', '알', '먹는', '다'],
    undefined,
    '한번 일로 두 가지 이득을 얻을 때가 있어요.',
  )
}

export function createOthersCakeProverbSentence() {
  return createSixPanelProverbSentence(
    OTHERS_CAKE_TEXT,
    [
      PROVERBS_IMAGES.othersCake01,
      PROVERBS_IMAGES.othersCake02,
      PROVERBS_IMAGES.othersCake03,
      PROVERBS_IMAGES.othersCake04,
      PROVERBS_IMAGES.othersCake05,
      PROVERBS_IMAGES.othersCake06,
    ],
    ['떡이', '더', '커', '보인', '다'],
    undefined,
    '똑같아도 남의 것이 더 좋아 보일 때가 있어요.',
  )
}

export function createSickleGiyeokProverbSentence() {
  return createSixPanelProverbSentence(
    SICKLE_GIYEOK_TEXT,
    [
      PROVERBS_IMAGES.sickleGiyeok01,
      PROVERBS_IMAGES.sickleGiyeok02,
      PROVERBS_IMAGES.sickleGiyeok03,
      PROVERBS_IMAGES.sickleGiyeok04,
      PROVERBS_IMAGES.sickleGiyeok05,
      PROVERBS_IMAGES.sickleGiyeok06,
    ],
    ['놓고', '기역', '자도', '모른', '다'],
    undefined,
    '쉬운 것도 모를 정도로 무지하면 안 돼요.',
    [glossAt(SICKLE_GIYEOK_TEXT, '기역', { term: '기역', definition: '한글 ㄱ 자' })],
  )
}

export function createDayBirdNightMouseProverbSentence() {
  return createSixPanelProverbSentence(
    DAY_BIRD_NIGHT_MOUSE_TEXT,
    [
      PROVERBS_IMAGES.dayBirdNightMouse01,
      PROVERBS_IMAGES.dayBirdNightMouse02,
      PROVERBS_IMAGES.dayBirdNightMouse03,
      PROVERBS_IMAGES.dayBirdNightMouse04,
      PROVERBS_IMAGES.dayBirdNightMouse05,
      PROVERBS_IMAGES.dayBirdNightMouse06,
    ],
    ['새가', '듣고', '밤말', '쥐가', '듣는'],
    undefined,
    '비밀 이야기도 결국 새어 나가요. 말조심해야 해요.',
  )
}

export function createNoseThreeFeetProverbSentence() {
  return createSixPanelProverbSentence(
    NOSE_THREE_FEET_TEXT,
    [
      PROVERBS_IMAGES.noseThreeFeet01,
      PROVERBS_IMAGES.noseThreeFeet02,
      PROVERBS_IMAGES.noseThreeFeet03,
      PROVERBS_IMAGES.noseThreeFeet04,
      PROVERBS_IMAGES.noseThreeFeet05,
      PROVERBS_IMAGES.noseThreeFeet06,
    ],
    ['내', '코가', '석', '자', '.'],
    undefined,
    '내 일도 버거울 때는 남 일까지 돌보기 어려워요.',
  )
}

export function createLieRiceCakeProverbSentence() {
  return createSixPanelProverbSentence(
    LIE_RICE_CAKE_TEXT,
    [
      PROVERBS_IMAGES.lieRiceCake01,
      PROVERBS_IMAGES.lieRiceCake02,
      PROVERBS_IMAGES.lieRiceCake03,
      PROVERBS_IMAGES.lieRiceCake04,
      PROVERBS_IMAGES.lieRiceCake05,
      PROVERBS_IMAGES.lieRiceCake06,
    ],
    ['누워', '서', '떡', '먹', '기'],
    undefined,
    '아주 쉬운 일을 말할 때 쓰는 말이에요.',
  )
}

export function createLieSpitProverbSentence() {
  return createSixPanelProverbSentence(
    LIE_SPIT_TEXT,
    [
      PROVERBS_IMAGES.lieSpit01,
      PROVERBS_IMAGES.lieSpit02,
      PROVERBS_IMAGES.lieSpit03,
      PROVERBS_IMAGES.lieSpit04,
      PROVERBS_IMAGES.lieSpit05,
      PROVERBS_IMAGES.lieSpit06,
    ],
    ['누워', '서', '침', '뱉', '기'],
    undefined,
    '남을 해치려다 결국 자기한테 돌아와요.',
  )
}

export function createSweetBitterProverbSentence() {
  return createSixPanelProverbSentence(
    SWEET_BITTER_TEXT,
    [
      PROVERBS_IMAGES.sweetBitter01,
      PROVERBS_IMAGES.sweetBitter02,
      PROVERBS_IMAGES.sweetBitter03,
      PROVERBS_IMAGES.sweetBitter04,
      PROVERBS_IMAGES.sweetBitter05,
      PROVERBS_IMAGES.sweetBitter06,
    ],
    ['삼키', '고', '쓰면', '뱉', '는다'],
    undefined,
    '이로우면 받고 해로우면 버리는 태도를 말해요.',
  )
}
