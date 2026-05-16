/** 제품키 비교용 정규화 (공백·하이픈 무시, 대문자) */
export function normalizeProductKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]+/g, '')
}
