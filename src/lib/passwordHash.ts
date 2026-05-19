/** 비밀번호 해시 — Firebase·로컬 검증용 (평문 저장 최소화) */
export async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const h = await hashPassword(password)
  return h === passwordHash
}
