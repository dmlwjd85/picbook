/** 로컬(체험·이전된 예전 계정) 비밀번호 해시. Firebase 계정 비밀번호는 Firebase Auth만 보관한다. */

const PBKDF2_PREFIX = 'pbkdf2-sha256'
const PBKDF2_ITERATIONS = 100_000
const PBKDF2_SALT_BYTES = 16
const PBKDF2_BITS = 256

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array | null {
  if (!hex || hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) return null
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return toHex(new Uint8Array(buf))
}

async function pbkdf2Hex(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    PBKDF2_BITS,
  )
  return toHex(new Uint8Array(bits))
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** 솔트를 붙인 PBKDF2 해시. 형식: pbkdf2-sha256$반복횟수$솔트(hex)$해시(hex) */
export async function hashLocalPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES))
  const hash = await pbkdf2Hex(password, salt, PBKDF2_ITERATIONS)
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${toHex(salt)}$${hash}`
}

/**
 * 로컬 계정 비밀번호 확인.
 * - 새 형식(PBKDF2+솔트)
 * - 예전 체험 계정 형식(SHA-256(아이디:비밀번호), 솔트 없음)
 * 평문과 비교하지 않는다.
 */
export async function verifyLocalPassword(
  loginId: string,
  password: string,
  stored: string | undefined,
): Promise<boolean> {
  if (!stored) return false

  if (stored.startsWith(`${PBKDF2_PREFIX}$`)) {
    const parts = stored.split('$')
    if (parts.length !== 4) return false
    const iterations = Number(parts[1])
    const salt = fromHex(parts[2] ?? '')
    const expected = parts[3] ?? ''
    if (!Number.isInteger(iterations) || iterations < 1 || !salt || !expected) return false
    const actual = await pbkdf2Hex(password, salt, iterations)
    return timingSafeEqual(actual, expected)
  }

  const legacy = await sha256Hex(`${loginId}:${password}`)
  return timingSafeEqual(legacy, stored)
}

export const LOCAL_PASSWORD_PBKDF2_PREFIX = PBKDF2_PREFIX
