/** 편집기 ↔ public 폴더 경로 매핑 */
export const EDITOR_INBOX_ROOT = 'editor-inbox'

export function proverbPanelPublicPath(slug: string, panelIndex1: number): string {
  const num = String(panelIndex1).padStart(2, '0')
  return `public/demo/proverbs/proverbs-${slug}-${num}.png`
}

export function inboxPathForPublic(bookId: string, publicRelative: string): string {
  const base = publicRelative.replace(/^public\//, '')
  return `${EDITOR_INBOX_ROOT}/${bookId}/${base.replace(/\//g, '__')}`
}

/** URL → public 상대 경로 (picbook base 제거) */
export function urlToPublicRelative(url: string): string | null {
  try {
    const u = new URL(url, window.location.origin)
    const path = u.pathname
    const idx = path.indexOf('/demo/')
    if (idx >= 0) return `public${path.slice(idx)}`
    const vd = path.indexOf('/visual-dictionary/')
    if (vd >= 0) return `public${path.slice(vd)}`
  } catch {
    /* data: URL 등 */
  }
  if (url.includes('/demo/proverbs/')) {
    const m = url.match(/\/demo\/proverbs\/[^?#]+/)
    if (m) return `public${m[0]}`
  }
  if (url.includes('/demo/powers/')) {
    const m = url.match(/\/demo\/powers\/[^?#]+/)
    if (m) return `public${m[0]}`
  }
  if (url.includes('/demo/samgwon')) {
    const m = url.match(/\/demo\/samgwon[^?#]*/)
    if (m) return `public${m[0]}`
  }
  return null
}
