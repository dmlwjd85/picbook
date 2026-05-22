import { cueAfterFirstChar } from '../lib/typedScriptSegments'

export const base = import.meta.env.BASE_URL

export const SLIDE_URLS = [1, 2, 3, 4, 5, 6].map((n) => `${base}demo/samgwon-${n}.png`)
export const DICTATOR_ROBE_URL = `${base}demo/samgwon-dictator-robe.png`
export const CHECK_ROPE_URL = `${base}demo/samgwon-check-wrists.png`
export const BALANCE_NOTEXT_URL = `${base}demo/samgwon-balance-notext.png`

export const W3 = 33.34

/** 낱막 첫 글자를 친 뒤 */
export const W = cueAfterFirstChar

/** typed.length 그대로 */
export const C = (n: number) => n

/** 문장 안 부분 문자열 첫 글자 입력 직후 charIndex */
export function idxAfter(text: string, needle: string): number {
  const i = text.indexOf(needle)
  if (i < 0) throw new Error(`"${needle}" not found in sentence`)
  return cueAfterFirstChar(i)
}

export function splitRemain(jw: number): { lw: number; ex: number } {
  const rem = 100 - jw
  const half = rem / 2
  return { lw: half, ex: jw + half }
}
