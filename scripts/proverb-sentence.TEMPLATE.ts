/**
 * ═══════════════════════════════════════════════════════════════
 *  속담 1편 추가 — 복붙용 템플릿
 * ═══════════════════════════════════════════════════════════════
 *
 * 【연출 비율 — 반드시 지킬 것】
 *  - 패널 1장: 3:2 (1536×1024) — 삼권분립·속담 공통. 1:1 정사각 금지
 *  - 그리드: 3열×2행, 4608×2048 (셀당 1536×1024), 패널에 글자 없음
 *  - 분할: scripts/split-proverbs-grid.mjs (3:2 그리드는 그대로 추출)
 *  - 1:1 셀만 있으면: node scripts/batch-outpaint-proverbs.mjs
 *
 * 【작업 순서】
 *  1) 이 파일을 복사 → src/data/myProverbSentence.ts
 *  2) 아래 CHANGEME 를 실제 값으로 교체
 *  3) elementaryProverbsAssets.ts 에 이미지 경로 6개 추가
 *  4) elementaryProverbsPack.ts 에 import + sentences 배열에 추가
 *  5) scripts/verify-proverbs-pack.mjs 의 PREFIXES 에 접두사 추가
 *  6) 그리드 PNG → public/demo/proverbs/_src/CHANGEME-grid.png
 *  7) node scripts/split-proverbs-grid.mjs public/demo/proverbs/_src/CHANGEME-grid.png proverbs-CHANGEME
 *  8) packContentVersions.ts elementary-proverbs 버전 +1
 *  9) npm run build
 */

import { createSixPanelProverbSentence } from '../lib/proverbSentence'
import { PROVERBS_IMAGES } from './elementaryProverbsAssets'
// import { glossAt } from './proverbVocab'  // 낱말 풀이 필요 시

/** 따라 쓸 속담 문장 (마침표 포함) */
export const CHANGEME_TEXT = '속담 문장 전체를 여기에.'

export function createChangemeProverbSentence() {
  return createSixPanelProverbSentence(
    CHANGEME_TEXT,
    [
      PROVERBS_IMAGES.changeme01, // proverbs-CHANGEME-01.png
      PROVERBS_IMAGES.changeme02,
      PROVERBS_IMAGES.changeme03,
      PROVERBS_IMAGES.changeme04,
      PROVERBS_IMAGES.changeme05,
      PROVERBS_IMAGES.changeme06,
    ],
    // 타이핑 진행에 맞춰 2~6컷 전환 (5개 단어/구절, 순서대로 문장 안에서 찾을 문자열)
    ['첫', '두', '세', '네', '다'],
    undefined, // cueNeedlesFrom — 같은 단어가 두 번 나오면 [0, 0, 3, 0, 0] 처럼 시작 위치
    '교훈을 구어체로, 짧고 친근하게.', // closingLine — 연출 하단 대사
    // vocabGlosses — 선택
    // [
    //   glossAt(CHANGEME_TEXT, '낱말', { term: '낱말', definition: '뜻 풀이' }),
    // ],
  )
}

/*
 * elementaryProverbsAssets.ts 추가 예:
 *
 *   changeme01: p('proverbs-CHANGEME-01.png'),
 *   ...
 *   changeme06: p('proverbs-CHANGEME-06.png'),
 *
 * verify-proverbs-pack.mjs PREFIXES 추가:
 *   'proverbs-CHANGEME',
 */
