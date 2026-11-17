/** 회원가입 입력 규칙 — 화면 안내 문구와 검사를 한곳에서 관리 */

/** Firebase Auth는 이메일 로그인만 받으므로 아이디를 내부용 주소로 바꿔 쓴다. 실제 메일은 보내지 않는다. */
const LOGIN_EMAIL_DOMAIN = 'picbook.example.com'

export const LOGIN_ID_HINT = '영문 소문자·숫자 4~16자'
export const NICKNAME_HINT = '2~10자 (랭킹에 보여요. 실명은 쓰지 마세요)'
export const PASSWORD_HINT = '8자 이상'

export function normalizeLoginId(raw: string): string {
  return raw.trim().toLowerCase()
}

export function validateLoginId(raw: string): string | null {
  const id = normalizeLoginId(raw)
  if (!id) return '아이디를 입력해 주세요.'
  if (!/^[a-z0-9]{4,16}$/.test(id)) return `아이디는 ${LOGIN_ID_HINT}로 만들어 주세요.`
  return null
}

export function validateNickname(raw: string): string | null {
  const name = raw.trim()
  if (name.length < 2 || name.length > 10) return '닉네임은 2~10자로 입력해 주세요.'
  return null
}

export function validatePassword(raw: string): string | null {
  if (raw.length < 8) return '비밀번호는 8자 이상으로 입력해 주세요.'
  if (raw.length > 64) return '비밀번호가 너무 깁니다.'
  return null
}

export function loginIdToEmail(loginId: string): string {
  return `${normalizeLoginId(loginId)}@${LOGIN_EMAIL_DOMAIN}`
}
