import { useState } from 'react'
import { useCustomPicbookStore } from '../state/customPicbookStore'
import { normalizeProductKey } from '../lib/productKey'

type Props = {
  onCreated: (bookId: string) => void
}

export function NewPicbookPanel({ onCreated }: Props) {
  const addBook = useCustomPicbookStore((s) => s.addBook)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('의미 청크 연출')
  const [blurb, setBlurb] = useState('')
  const [productKey, setProductKey] = useState('')
  const [sentencesText, setSentencesText] = useState('첫 문장을 여기에 적어 주세요.')

  const onSubmit = () => {
    const t = title.trim()
    if (!t) {
      window.alert('제목을 입력해 주세요.')
      return
    }
    const sentences = sentencesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    const key = normalizeProductKey(productKey.trim() || `PICBOOK-${t.slice(0, 8)}`)
    const book = addBook({
      id: '',
      title: t,
      subtitle: subtitle.trim() || 'PicBook',
      blurb: blurb.trim() || `${t} — 타자에 맞춰 그림이 바뀝니다.`,
      author: 'PicBook',
      productKey: key,
      productKeyDisplay: productKey.trim() || key,
      listPrice: '₩0',
      coverImage: `${import.meta.env.BASE_URL}visual-dictionary/nouns/n_rabbit_01.png`,
      magazineTone: 'from-violet-600 via-fuchsia-500 to-pink-600',
      sentences: sentences.length > 0 ? sentences : ['첫 문장을 입력해 주세요.'],
    })
    setOpen(false)
    setTitle('')
    setBlurb('')
    setProductKey('')
    onCreated(book.id)
    window.alert(`「${book.title}」 픽북을 만들었습니다. 수어 사전을 채운 뒤 저장·배포하세요.`)
  }

  if (!open) {
    return (
      <button
        type="button"
        className="rounded-lg border border-dashed border-indigo-400 bg-white px-3 py-2 text-xs font-bold text-indigo-800 hover:bg-indigo-50"
        onClick={() => setOpen(true)}
      >
        + 새 PicBook 만들기
      </button>
    )
  }

  return (
    <section className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-indigo-900">새 PicBook</h3>
      <p className="mt-1 text-xs text-slate-600">문장·시각 사전·타임라인을 편집한 뒤 「배포」로 Firebase·사이트에 반영합니다.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-700">
          제목 *
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="text-xs font-medium text-slate-700">
          부제
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </label>
        <label className="col-span-full text-xs font-medium text-slate-700">
          소개
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={blurb} onChange={(e) => setBlurb(e.target.value)} />
        </label>
        <label className="text-xs font-medium text-slate-700">
          제품키 (선택)
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-mono" value={productKey} onChange={(e) => setProductKey(e.target.value)} placeholder="PICBOOK-MYSTORY-2026" />
        </label>
        <label className="col-span-full text-xs font-medium text-slate-700">
          문장 (한 줄에 한 문장)
          <textarea rows={5} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={sentencesText} onChange={(e) => setSentencesText(e.target.value)} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700" onClick={onSubmit}>
          만들기
        </button>
        <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setOpen(false)}>
          취소
        </button>
      </div>
    </section>
  )
}
