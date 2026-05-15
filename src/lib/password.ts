/** 숫자 6자리 비밀번호 형식 검사 */
export function isValidSixDigitPassword(value: string): boolean {
  return /^\d{6}$/.test(value)
}

/** 비밀번호 입력 필드용: 숫자만 최대 6자리 */
export function sanitizeSixDigitInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}
