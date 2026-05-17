/**
 * 팩 본문·연출·이미지를 수정할 때마다 해당 bookId의 버전을 올리면,
 * 이미 구매(잠금 해제)한 사용자에게도 재생 시 최신 팩이 자동 적용된다.
 */
export const PACK_CONTENT_VERSIONS: Record<string, string> = {
  'demo-separation-three-powers': '9',
  'elementary-proverbs': '20',
}

export function getPackContentVersion(bookId: string): string {
  return PACK_CONTENT_VERSIONS[bookId] ?? '1'
}
