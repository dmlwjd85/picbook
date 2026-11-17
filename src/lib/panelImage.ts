import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getPicbookAuth, getPicbookStorage } from './firebase'
import { createId } from './ids'

/** 재생 무대는 3:2 — 교실 화면에 충분하면서 가볍게 내려받을 크기 */
const MAX_W = 1200
const MAX_H = 800
const QUALITY = 0.82

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`「${file.name}」을(를) 그림으로 열 수 없어요. JPG·PNG·WebP로 바꿔 주세요.`))
    }
    img.src = url
  })
}

/** 큰 사진을 줄이고 WebP로 압축한다 */
export async function compressPanelImage(file: File): Promise<Blob> {
  const img = await loadImage(file)
  const ratio = Math.min(1, MAX_W / img.naturalWidth, MAX_H / img.naturalHeight)
  const w = Math.max(1, Math.round(img.naturalWidth * ratio))
  const h = Math.max(1, Math.round(img.naturalHeight * ratio))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이 브라우저에서는 그림을 처리할 수 없어요.')
  ctx.drawImage(img, 0, 0, w, h)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
  if (!blob) throw new Error('그림 압축에 실패했어요.')
  return blob
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('그림을 읽지 못했어요.'))
    reader.readAsDataURL(blob)
  })
}

/**
 * 그림을 압축해 저장하고 재생에 쓸 주소를 돌려준다.
 * - Firebase Storage가 설정돼 있고 로그인 상태면 `picbooks/{bookId}/`에 올린다(관리자만 쓰기 가능 — storage.rules)
 * - 아니면 이 기기에만 저장되는 data URL (체험 모드)
 */
export async function savePanelImage(bookId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`「${file.name}」은(는) 그림 파일이 아니에요.`)
  const blob = await compressPanelImage(file)
  const storage = getPicbookStorage()
  if (storage && getPicbookAuth()?.currentUser) {
    const path = `picbooks/${bookId}/${createId()}.webp`
    const target = ref(storage, path)
    try {
      await uploadBytes(target, blob, {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000, immutable',
      })
      return await getDownloadURL(target)
    } catch (e) {
      const code = (e as { code?: string } | null)?.code
      console.warn('[PicBook] 그림 올리기 실패', e)
      if (code === 'storage/unauthorized') {
        throw new Error('그림을 올릴 권한이 없어요. 관리자로 등록된 계정으로 로그인했는지 확인해 주세요.')
      }
      throw new Error('그림을 올리지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.')
    }
  }
  return blobToDataUrl(blob)
}

/** 클라우드에 올리지 못한 그림인지(이 기기에서만 보임) */
export function isLocalOnlyImage(url: string): boolean {
  return url.startsWith('data:')
}
