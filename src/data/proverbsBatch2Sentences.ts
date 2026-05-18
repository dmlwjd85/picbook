import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'

/** 16~30편 속담 — 6컷 연출 */

export const EAR_NOSE_TEXT = '귀에 걸면 귀걸이 코에 걸면 코걸이.'
export function createEarNoseProverbSentence() {
  return createSixPanelProverbSentence(
    EAR_NOSE_TEXT,
    [
      PROVERBS_IMAGES.earNose01,
      PROVERBS_IMAGES.earNose02,
      PROVERBS_IMAGES.earNose03,
      PROVERBS_IMAGES.earNose04,
      PROVERBS_IMAGES.earNose05,
      PROVERBS_IMAGES.earNose06,
    ],
    ['귀에', '걸면', '귀걸이', '코에', '코걸이'],
    undefined,
    '같은 사실도 자기에게 유리하게만 해석하면 안 돼요.',
  )
}

export const PICTURE_CAKE_TEXT = '그림의 떡.'
export function createPictureCakeProverbSentence() {
  return createSixPanelProverbSentence(
    PICTURE_CAKE_TEXT,
    [
      PROVERBS_IMAGES.pictureCake01,
      PROVERBS_IMAGES.pictureCake02,
      PROVERBS_IMAGES.pictureCake03,
      PROVERBS_IMAGES.pictureCake04,
      PROVERBS_IMAGES.pictureCake05,
      PROVERBS_IMAGES.pictureCake06,
    ],
    ['그', '림', '의', '떡', '.'],
    undefined,
    '보기만 좋고, 실제로는 가질 수 없는 것이 있어요.',
  )
}

export const FOOD_FIRST_TEXT = '금강산도 식후경.'
export function createFoodFirstProverbSentence() {
  return createSixPanelProverbSentence(
    FOOD_FIRST_TEXT,
    [
      PROVERBS_IMAGES.foodFirst01,
      PROVERBS_IMAGES.foodFirst02,
      PROVERBS_IMAGES.foodFirst03,
      PROVERBS_IMAGES.foodFirst04,
      PROVERBS_IMAGES.foodFirst05,
      PROVERBS_IMAGES.foodFirst06,
    ],
    ['금강', '산도', '식후', '경', '.'],
    undefined,
    '아무리 좋은 구경도 배가 부른 뒤에야 더 즐거워요.',
  )
}

export const CRAWL_RUN_TEXT = '기지도 못하면서 뛰려고 한다.'
export function createCrawlRunProverbSentence() {
  return createSixPanelProverbSentence(
    CRAWL_RUN_TEXT,
    [
      PROVERBS_IMAGES.crawlRun01,
      PROVERBS_IMAGES.crawlRun02,
      PROVERBS_IMAGES.crawlRun03,
      PROVERBS_IMAGES.crawlRun04,
      PROVERBS_IMAGES.crawlRun05,
      PROVERBS_IMAGES.crawlRun06,
    ],
    ['기지', '못하', '면서', '뛰려', '한다'],
    undefined,
    '기초도 없이 어려운 것부터 하려고 하면 안 돼요.',
  )
}

export const LONG_TAIL_TEXT = '꼬리가 길면 밟힌다.'
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
    ['꼬리', '길면', '밟', '힌', '다'],
    undefined,
    '나쁜 일을 오래 하면 결국 들통나요.',
  )
}

export const CROW_SHIP_TEXT = '까마귀 날자 배 떨어진다.'
export function createCrowShipProverbSentence() {
  return createSixPanelProverbSentence(
    CROW_SHIP_TEXT,
    [
      PROVERBS_IMAGES.crowShip01,
      PROVERBS_IMAGES.crowShip02,
      PROVERBS_IMAGES.crowShip03,
      PROVERBS_IMAGES.crowShip04,
      PROVERBS_IMAGES.crowShip05,
      PROVERBS_IMAGES.crowShip06,
    ],
    ['까마', '귀', '날자', '배', '떨어'],
    undefined,
    '관계없는 일이 겹치면 억울하게 의심받을 수 있어요.',
  )
}

export const PHEASANT_CHICKEN_TEXT = '꿩 대신 닭.'
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
    '딱 맞는 게 없을 때 비슷한 것으로 대신할 수 있어요.',
  )
}

export const PHEASANT_EGG_TEXT = '꿩 먹고 알 먹는다.'
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
    ['꿩', '먹고', '알', '먹', '는다'],
    undefined,
    '한 번 일로 두 가지 이득을 얻을 때가 있어요.',
  )
}

export const OTHERS_CAKE_TEXT = '남의 떡이 더 커 보인다.'
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
    ['남의', '떡이', '더', '커', '보인'],
    undefined,
    '똑같아도 남 것이 더 좋아 보일 때가 있어요.',
  )
}

export const SICKLE_LETTER_TEXT = '낫 놓고 기역 자도 모른다.'
export function createSickleLetterProverbSentence() {
  return createSixPanelProverbSentence(
    SICKLE_LETTER_TEXT,
    [
      PROVERBS_IMAGES.sickleLetter01,
      PROVERBS_IMAGES.sickleLetter02,
      PROVERBS_IMAGES.sickleLetter03,
      PROVERBS_IMAGES.sickleLetter04,
      PROVERBS_IMAGES.sickleLetter05,
      PROVERBS_IMAGES.sickleLetter06,
    ],
    ['낫', '놓고', '기역', '자도', '모른'],
    undefined,
    '눈앞의 쉬운 것도 모를 정도로 무지하면 안 돼요.',
  )
}

export const BIRD_MOUSE_TEXT = '낮말은 새가 듣고 밤말은 쥐가 듣는다.'
export function createBirdMouseProverbSentence() {
  return createSixPanelProverbSentence(
    BIRD_MOUSE_TEXT,
    [
      PROVERBS_IMAGES.birdMouse01,
      PROVERBS_IMAGES.birdMouse02,
      PROVERBS_IMAGES.birdMouse03,
      PROVERBS_IMAGES.birdMouse04,
      PROVERBS_IMAGES.birdMouse05,
      PROVERBS_IMAGES.birdMouse06,
    ],
    ['낮말', '새가', '밤말', '쥐가', '듣는'],
    undefined,
    '비밀처럼 한 말도 결국 새어 나갈 수 있어요.',
  )
}

export const NOSE_THREE_TEXT = '내 코가 석 자.'
export function createNoseThreeProverbSentence() {
  return createSixPanelProverbSentence(
    NOSE_THREE_TEXT,
    [
      PROVERBS_IMAGES.noseThree01,
      PROVERBS_IMAGES.noseThree02,
      PROVERBS_IMAGES.noseThree03,
      PROVERBS_IMAGES.noseThree04,
      PROVERBS_IMAGES.noseThree05,
      PROVERBS_IMAGES.noseThree06,
    ],
    ['내', '코가', '석', '자', '.'],
    undefined,
    '내 사정도 힘든데 남 걱정할 여유가 없을 때가 있어요.',
  )
}

export const LIE_CAKE_TEXT = '누워서 떡 먹기.'
export function createLieCakeProverbSentence() {
  return createSixPanelProverbSentence(
    LIE_CAKE_TEXT,
    [
      PROVERBS_IMAGES.lieCake01,
      PROVERBS_IMAGES.lieCake02,
      PROVERBS_IMAGES.lieCake03,
      PROVERBS_IMAGES.lieCake04,
      PROVERBS_IMAGES.lieCake05,
      PROVERBS_IMAGES.lieCake06,
    ],
    ['누워', '서', '떡', '먹', '기'],
    undefined,
    '아주 쉬워서 힘이 거의 안 드는 일을 말해요.',
  )
}

export const LIE_SPIT_TEXT = '누워서 침 뱉기.'
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
    '남을 해치려다 결국 자기한테 돌아올 수 있어요.',
  )
}

export const SWEET_BITTER_TEXT = '달면 삼키고 쓰면 뱉는다.'
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
    ['달면', '삼키', '고', '쓰면', '뱉는'],
    undefined,
    '이로우면 받아들이고 해로우면 버리는 태도는 옳지 않아요.',
  )
}
