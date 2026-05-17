import { cueAfterFirstChar } from '../lib/typedScriptSegments'

/** 문장 안 부분 문자열 첫 글자 입력 직후 charIndex */
export function idxAfter(text: string, needle: string, from = 0): number {
  const i = text.indexOf(needle, from)
  if (i < 0) throw new Error(`"${needle}" not found in sentence`)
  return cueAfterFirstChar(i)
}
