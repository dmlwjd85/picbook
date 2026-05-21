/** 마스터가 편집기에서 만든 사용자 정의 PicBook 메타 */
export type CustomPicbookRecord = {
  id: string
  title: string
  subtitle: string
  blurb: string
  author: string
  productKey: string
  productKeyDisplay: string
  listPrice: string
  coverImage: string
  magazineTone: string
  sentences: string[]
  contentVersion: string
  createdAt: string
  updatedAt: string
}
