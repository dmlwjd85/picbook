/** 이미지 URL → 팩 내 패널 식별자 (마스터 연출 저장 키) */
export function panelKeyFromImageUrl(imageUrl: string): string {
  try {
    const base = typeof import.meta !== 'undefined' ? import.meta.env.BASE_URL : '/'
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const u = new URL(imageUrl, origin)
    let path = u.pathname
    const basePath = base.endsWith('/') ? base.slice(0, -1) : base
    if (basePath && path.startsWith(basePath)) {
      path = path.slice(basePath.length) || path
    }
    return path.replace(/^\//, '')
  } catch {
    return imageUrl
  }
}
