import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PanelSentenceEditor } from '../components/admin/PanelSentenceEditor'
import { PassKeysPanel } from '../components/admin/PassKeysPanel'
import { getEditableCatalogItems, type PicbookCatalogItem } from '../data/picbookCatalog'
import {
  PICBOOK_CATEGORIES,
  PICBOOK_GRADES,
  categoryLabel,
  type PicbookCategoryId,
} from '../data/picbookCategories'
import { sentenceBlockToPanel } from '../lib/bookEdits'
import { unpublishCustomPicbook } from '../lib/customPicbookFirebase'
import { isFirebaseEnabled } from '../lib/firebase'
import { isLocalOnlyImage } from '../lib/panelImage'
import { createId } from '../lib/ids'
import { normalizeProductKey } from '../lib/productKey'
import { useBookEditStore } from '../state/bookEditStore'
import { useCustomPicbookStore } from '../state/customPicbookStore'
import { useUserAccountStore } from '../state/userAccountStore'
import type { CustomPicbookRecord, PanelSentence } from '../types/customPicbook'
import type { PicbookManifest } from '../types/picbookManifest'

/** 편집 화면의 문장 한 줄 */
type Row = {
  /** 검수 표시용 키 */
  key: string
  index: number
  text: string
  /** 그림이 차례로 바뀌는 문장이면 편집창으로 고칠 수 있다. null이면 여러 겹 연출이라 문장만 고친다 */
  panel: PanelSentence | null
  /** 원본과 달라졌는지(기본 제공 픽북만) */
  edited: boolean
}

type MetaDraft = {
  title: string
  category: PicbookCategoryId
  grade: number
  subject: string
  blurb: string
  free: boolean
  productKey: string
}

const EMPTY_META: MetaDraft = {
  title: '',
  category: 'fairy-tale',
  grade: 6,
  subject: '',
  blurb: '',
  free: true,
  productKey: '',
}

function MetaForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: MetaDraft
  submitLabel: string
  onSubmit: (draft: MetaDraft) => void
  onCancel: () => void
}) {
  const [d, setD] = useState(initial)
  const input =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none'
  return (
    <form
      className="grid gap-3 rounded-2xl border border-orange-200 bg-orange-50/60 p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!d.title.trim()) return
        onSubmit(d)
      }}
    >
      <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
        제목
        <input className={input} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} required />
      </label>
      <label className="text-xs font-semibold text-slate-700">
        분류
        <select
          className={input}
          value={d.category}
          onChange={(e) => setD({ ...d, category: e.target.value as PicbookCategoryId })}
        >
          {PICBOOK_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      {d.category === 'curriculum' ? (
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-slate-700">
            학년
            <select className={input} value={d.grade} onChange={(e) => setD({ ...d, grade: Number(e.target.value) })}>
              {PICBOOK_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}학년
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            과목
            <input
              className={input}
              value={d.subject}
              placeholder="예: 사회"
              onChange={(e) => setD({ ...d, subject: e.target.value })}
            />
          </label>
        </div>
      ) : (
        <div />
      )}
      <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
        소개 (서점 카드에 보여요)
        <input className={input} value={d.blurb} onChange={(e) => setD({ ...d, blurb: e.target.value })} />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <input type="checkbox" checked={d.free} onChange={(e) => setD({ ...d, free: e.target.checked })} />
        무료로 제공
      </label>
      {!d.free ? (
        <label className="text-xs font-semibold text-slate-700">
          제품키
          <input
            className={`${input} font-mono`}
            value={d.productKey}
            placeholder="PICBOOK-MYBOOK-2026"
            onChange={(e) => setD({ ...d, productKey: e.target.value })}
          />
        </label>
      ) : (
        <div />
      )}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700">
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          취소
        </button>
      </div>
    </form>
  )
}

function metaPatch(d: MetaDraft): Partial<CustomPicbookRecord> {
  const key = d.productKey.trim()
  return {
    title: d.title.trim(),
    category: d.category,
    grade: d.category === 'curriculum' ? d.grade : undefined,
    subject: d.category === 'curriculum' ? d.subject.trim() : undefined,
    subtitle: categoryLabel(d.category, d.grade, d.subject),
    blurb: d.blurb.trim() || `${d.title.trim()} — 따라 쓰면 그림이 차례로 바뀝니다.`,
    free: d.free,
    listPrice: d.free ? '₩0' : '',
    ...(key ? { productKey: normalizeProductKey(key), productKeyDisplay: key } : {}),
  }
}

export default function AdminEditorPage() {
  const customBooks = useCustomPicbookStore((s) => s.books)
  const addBook = useCustomPicbookStore((s) => s.addBook)
  const updateBook = useCustomPicbookStore((s) => s.updateBook)
  const removeBook = useCustomPicbookStore((s) => s.removeBook)
  const bumpVersion = useCustomPicbookStore((s) => s.bumpVersion)
  const publishCustom = useCustomPicbookStore((s) => s.publishBook)
  const edits = useBookEditStore((s) => s.byBook)
  const dirtyBookIds = useBookEditStore((s) => s.dirtyBookIds)
  const setPanel = useBookEditStore((s) => s.setPanel)
  const setText = useBookEditStore((s) => s.setText)
  const resetSentence = useBookEditStore((s) => s.resetSentence)
  const setReviewed = useBookEditStore((s) => s.setReviewed)
  const publishEdit = useBookEditStore((s) => s.publish)
  const isAdmin = useUserAccountStore((s) => s.isAdmin)

  const books = useMemo(() => getEditableCatalogItems(), [customBooks])
  const [categoryFilter, setCategoryFilter] = useState<PicbookCategoryId | 'all'>('all')
  const [bookId, setBookId] = useState<string | null>(books[0]?.id ?? null)
  const [todoOnly, setTodoOnly] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [textEditIndex, setTextEditIndex] = useState<number | null>(null)
  const [textDraft, setTextDraft] = useState('')
  const [metaMode, setMetaMode] = useState<'none' | 'new' | 'edit'>('none')
  const [notice, setNotice] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [showKeys, setShowKeys] = useState(false)

  const book: PicbookCatalogItem | undefined = books.find((b) => b.id === bookId)
  const custom = customBooks.find((b) => b.id === bookId)
  const edit = bookId ? edits[bookId] : undefined
  const reviewed = useMemo(() => new Set(edit?.reviewed ?? []), [edit?.reviewed])

  const rows: Row[] = useMemo(() => {
    if (!book) return []
    if (custom) {
      return (custom.panelSentences ?? []).map((p, index) => ({
        key: p.id,
        index,
        text: p.text,
        panel: p,
        edited: false,
      }))
    }
    let base
    try {
      base = book.loadPack()
    } catch {
      return []
    }
    return base.sentences.map((block, index) => {
      const editedPanel = edit?.panels[index]
      const editedText = edit?.texts[index]
      const panel = editedPanel ?? sentenceBlockToPanel(block, `${book.id}-s${index}`)
      return {
        key: String(index),
        index,
        text: editedPanel?.text ?? editedText ?? block.text,
        panel,
        edited: Boolean(editedPanel) || editedText != null,
      }
    })
  }, [book, custom, edit])

  const visibleRows = todoOnly ? rows.filter((r) => !reviewed.has(r.key)) : rows
  const reviewedCount = rows.filter((r) => reviewed.has(r.key)).length
  const hasUnpublished = Boolean(bookId && dirtyBookIds.includes(bookId)) || Boolean(custom)
  const listed = books.filter((b) => categoryFilter === 'all' || b.category === categoryFilter)

  const selectBook = (id: string) => {
    setBookId(id)
    setEditingIndex(null)
    setTextEditIndex(null)
    setMetaMode('none')
    setNotice(null)
  }

  /** 편집창에서 저장 — 직접 만든 픽북은 책 자체를, 기본 제공 픽북은 덧씌우는 수정본을 고친다 */
  const savePanel = (index: number, next: PanelSentence) => {
    if (!bookId) return
    if (custom) {
      const list = [...(custom.panelSentences ?? [])]
      if (index >= list.length) list.push(next)
      else list[index] = next
      const usesDefaultCover = !custom.coverImage || custom.coverImage.includes('visual-dictionary/')
      updateBook(custom.id, {
        panelSentences: list,
        ...(usesDefaultCover && list[0]?.images[0] ? { coverImage: list[0].images[0] } : {}),
      })
    } else {
      setPanel(bookId, index, next)
    }
  }

  const openNextAfter = (index: number) => {
    const next = rows.find((r) => r.index > index && r.panel && !reviewed.has(r.key))
    setEditingIndex(next ? next.index : null)
    if (!next) setNotice('마지막 문장까지 검수했어요. 「배포하기」를 누르면 모두에게 반영됩니다.')
  }

  const moveSentence = (index: number, dir: -1 | 1) => {
    if (!custom) return
    const list = [...(custom.panelSentences ?? [])]
    const to = index + dir
    if (to < 0 || to >= list.length) return
    ;[list[index], list[to]] = [list[to], list[index]]
    updateBook(custom.id, { panelSentences: list })
  }

  const deleteSentence = (index: number) => {
    if (!custom) return
    if (!window.confirm(`${index + 1}번 문장을 지울까요?`)) return
    updateBook(custom.id, { panelSentences: (custom.panelSentences ?? []).filter((_, i) => i !== index) })
  }

  const publish = async () => {
    if (!bookId) return
    if (!isFirebaseEnabled()) {
      setNotice('Firebase가 연결되지 않아 이 기기에만 저장되어 있어요. 연결 방법은 docs/FIREBASE_SETUP.md를 보세요.')
      return
    }
    // 클라우드에 올라가지 않은 그림(이 기기에만 있는 그림)이 섞이면 다른 사람 화면에는 보이지 않는다
    const localOnly = rows.reduce((n, r) => n + (r.panel?.images.filter(isLocalOnlyImage).length ?? 0), 0)
    if (localOnly > 0) {
      setNotice(
        `그림 ${localOnly}장이 이 기기에만 저장되어 있어 배포할 수 없어요. Firebase Storage를 연결한 뒤 그 그림들을 「바꾸기」로 다시 올려 주세요. (그림에 '이 기기에만' 표시가 있어요)`,
      )
      return
    }
    setPublishing(true)
    let ok = true
    if (custom) {
      bumpVersion(custom.id)
      ok = await publishCustom(custom.id)
    }
    ok = (await publishEdit(bookId)) && ok
    setPublishing(false)
    setNotice(
      ok
        ? '배포했어요. 학생 화면은 새로 열면 바뀐 내용이 보입니다.'
        : isAdmin
          ? '배포하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.'
          : '배포하지 못했어요. 관리자로 등록된 계정으로 로그인해야 배포할 수 있습니다.',
    )
  }

  const downloadJson = () => {
    if (!book) return
    const manifest: PicbookManifest = {
      id: book.id,
      title: book.title,
      subtitle: book.subtitle,
      blurb: book.blurb,
      category: book.category,
      ...(book.grade ? { grade: book.grade } : {}),
      ...(book.subject ? { subject: book.subject } : {}),
      free: Boolean(book.free),
      productKey: book.productKeyDisplay,
      listPrice: book.listPrice,
      contentVersion: book.contentVersion,
      sentences: rows
        .filter((r) => r.panel)
        .map((r) => ({
          text: r.panel!.text,
          images: r.panel!.images,
          cueIndexes: r.panel!.cueIndexes,
          ...(r.panel!.closingLine ? { closingLine: r.panel!.closingLine } : {}),
        })),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${book.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const editingRow = editingIndex != null ? rows.find((r) => r.index === editingIndex) : undefined
  const isNewSentence = Boolean(custom) && editingIndex != null && editingIndex >= rows.length
  const editingPanel: PanelSentence | null =
    editingRow?.panel ?? (isNewSentence ? { id: createId(), text: '', images: [], cueIndexes: [] } : null)

  return (
    <div className="min-h-[100dvh] bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link to="/" className="text-xs font-semibold text-orange-700 hover:underline">
              ← PicBook 홈
            </Link>
            <h1 className="text-xl font-bold text-slate-900">픽북 편집 · 검수</h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 font-semibold ${
                isFirebaseEnabled() ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isFirebaseEnabled() ? (isAdmin ? '관리자 · 배포 가능' : '관리자 계정 아님 · 이 기기에만 저장') : '체험 모드 · 이 기기에만 저장'}
            </span>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setShowKeys((v) => !v)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50"
              >
                이용권 코드
              </button>
            ) : null}
            <Link to="/editor" className="rounded-lg border border-slate-300 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50">
              세부 연출 편집기
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[280px_1fr]">
        {/* 책 목록 */}
        <aside className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'all' as const, label: '전체' }, ...PICBOOK_CATEGORIES].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryFilter(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  categoryFilter === c.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <ul className="space-y-1.5">
            {listed.map((b) => {
              const isCustom = customBooks.some((c) => c.id === b.id)
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => selectBook(b.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${
                      b.id === bookId ? 'border-orange-500 bg-white shadow' : 'border-transparent bg-white/70 hover:bg-white'
                    }`}
                  >
                    <img src={b.coverImage} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-900">{b.title}</span>
                      <span className="block text-[11px] text-slate-500">
                        {categoryLabel(b.category, b.grade, b.subject)}
                        {isCustom ? ' · 직접 만든 책' : ''}
                        {dirtyBookIds.includes(b.id) ? ' · 배포 전 수정 있음' : ''}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            {listed.length === 0 ? <li className="px-2 py-4 text-sm text-slate-500">이 분류에는 아직 책이 없어요.</li> : null}
          </ul>
          <button
            type="button"
            onClick={() => setMetaMode('new')}
            className="w-full rounded-xl border-2 border-dashed border-slate-300 py-2.5 text-sm font-bold text-slate-600 hover:border-orange-400 hover:text-orange-700"
          >
            ＋ 새 픽북 만들기
          </button>
        </aside>

        {/* 선택한 책 */}
        <main className="space-y-4">
          {metaMode === 'new' ? (
            <MetaForm
              initial={EMPTY_META}
              submitLabel="픽북 만들기"
              onCancel={() => setMetaMode('none')}
              onSubmit={(d) => {
                const patch = metaPatch(d)
                const created = addBook({
                  id: `book-${createId().slice(0, 8)}`,
                  title: patch.title!,
                  subtitle: patch.subtitle!,
                  blurb: patch.blurb!,
                  author: 'PicBook',
                  productKey: patch.productKey ?? '',
                  productKeyDisplay: patch.productKeyDisplay ?? '',
                  listPrice: patch.listPrice!,
                  coverImage: '',
                  magazineTone: '',
                  category: patch.category,
                  grade: patch.grade,
                  subject: patch.subject,
                  free: patch.free,
                  sentences: [],
                  panelSentences: [],
                })
                selectBook(created.id)
              }}
            />
          ) : null}

          {showKeys && isAdmin ? <PassKeysPanel /> : null}

          {!book ? (
            <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">왼쪽에서 책을 고르세요.</p>
          ) : (
            <>
              <section className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-orange-700">{categoryLabel(book.category, book.grade, book.subject)}</p>
                    <h2 className="text-lg font-bold text-slate-900">{book.title}</h2>
                    <p className="mt-0.5 text-sm text-slate-600">
                      문장 {rows.length}개 · 검수 완료 {reviewedCount}개
                      {!custom ? ' · 기본 제공 책 (고친 문장만 덧씌워 저장돼요)' : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {custom ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setMetaMode(metaMode === 'edit' ? 'none' : 'edit')}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          책 정보 고치기
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!window.confirm(`「${custom.title}」을(를) 지울까요? 배포된 책도 함께 내려갑니다.`)) return
                            void unpublishCustomPicbook(custom.id)
                            removeBook(custom.id)
                            setBookId(null)
                          }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          책 지우기
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={downloadJson}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      JSON 내려받기
                    </button>
                    <Link
                      to={`/play/${book.id}`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      학생 화면으로 보기
                    </Link>
                    <button
                      type="button"
                      onClick={() => void publish()}
                      disabled={publishing || !hasUnpublished}
                      className="rounded-lg bg-orange-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-40"
                    >
                      {publishing ? '배포 중…' : '배포하기'}
                    </button>
                  </div>
                </div>
                {rows.length > 0 ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden>
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.round((reviewedCount / rows.length) * 100)}%` }}
                    />
                  </div>
                ) : null}
                {notice ? <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{notice}</p> : null}
              </section>

              {metaMode === 'edit' && custom ? (
                <MetaForm
                  initial={{
                    title: custom.title,
                    category: custom.category ?? 'etc',
                    grade: custom.grade ?? 6,
                    subject: custom.subject ?? '',
                    blurb: custom.blurb,
                    free: Boolean(custom.free),
                    productKey: custom.productKeyDisplay,
                  }}
                  submitLabel="책 정보 저장"
                  onCancel={() => setMetaMode('none')}
                  onSubmit={(d) => {
                    updateBook(custom.id, metaPatch(d))
                    setMetaMode('none')
                  }}
                />
              ) : null}

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={todoOnly} onChange={(e) => setTodoOnly(e.target.checked)} />
                  검수 전 문장만 보기
                </label>
                {custom ? (
                  <button
                    type="button"
                    onClick={() => setEditingIndex(rows.length)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    ＋ 문장 추가 (문장 + 그림 4~8장)
                  </button>
                ) : null}
              </div>

              <ol className="space-y-2">
                {visibleRows.map((r) => {
                  const done = reviewed.has(r.key)
                  return (
                    <li key={r.key} className="rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex flex-wrap items-start gap-3">
                        <span className="mt-0.5 w-8 shrink-0 text-center text-sm font-bold text-slate-400">{r.index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-slate-900">{r.text}</p>
                          {r.panel ? (
                            <div className="mt-2 flex gap-1 overflow-x-auto">
                              {r.panel.images.map((url, i) => (
                                <img
                                  key={`${url}-${i}`}
                                  src={url}
                                  alt=""
                                  loading="lazy"
                                  className="h-14 w-[5.25rem] shrink-0 rounded-md bg-slate-200 object-cover"
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-slate-500">
                              그림 여러 겹을 겹치는 연출 문장이에요. 여기서는 문장만 고치고, 그림 연출은 「세부 연출 편집기」에서 고칩니다.
                            </p>
                          )}
                          <p className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-bold">
                            {r.panel ? <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">그림 {r.panel.images.length}장</span> : null}
                            {r.edited ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">수정됨</span> : null}
                            <span className={`rounded px-1.5 py-0.5 ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                              {done ? '검수 완료' : '검수 전'}
                            </span>
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                          {custom ? (
                            <>
                              <button type="button" aria-label="위로" disabled={r.index === 0} onClick={() => moveSentence(r.index, -1)} className="rounded border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30">▲</button>
                              <button type="button" aria-label="아래로" disabled={r.index === rows.length - 1} onClick={() => moveSentence(r.index, 1)} className="rounded border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 disabled:opacity-30">▼</button>
                              <button type="button" onClick={() => deleteSentence(r.index)} className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600">지우기</button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => bookId && setReviewed(bookId, r.key, !done)}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {done ? '검수 취소' : '검수 완료로 표시'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (r.panel) setEditingIndex(r.index)
                              else {
                                setTextDraft(r.text)
                                setTextEditIndex(r.index)
                              }
                            }}
                            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700"
                          >
                            {r.panel ? '편집창 열기' : '문장 고치기'}
                          </button>
                        </div>
                      </div>
                      {textEditIndex === r.index && bookId ? (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                          <input
                            value={textDraft}
                            onChange={(e) => setTextDraft(e.target.value)}
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            aria-label={`${r.index + 1}번 문장`}
                          />
                          <button type="button" onClick={() => { if (textDraft.trim()) setText(bookId, r.index, textDraft.trim()); setTextEditIndex(null) }} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">저장</button>
                          {r.edited ? (
                            <button type="button" onClick={() => { resetSentence(bookId, r.index); setTextEditIndex(null) }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">원래대로</button>
                          ) : null}
                          <button type="button" onClick={() => setTextEditIndex(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">취소</button>
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ol>
              {visibleRows.length === 0 ? (
                <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
                  {rows.length === 0
                    ? '아직 문장이 없어요. 「문장 추가」로 문장과 그림 4~8장을 넣어 보세요.'
                    : '검수 전인 문장이 없어요.'}
                </p>
              ) : null}
            </>
          )}
        </main>
      </div>

      {editingPanel && editingIndex != null && bookId ? (
        <PanelSentenceEditor
          key={`${bookId}-${editingIndex}-${editingPanel.id}`}
          bookId={bookId}
          heading={isNewSentence ? '새 문장 만들기' : `${editingIndex + 1}번 문장 고치기`}
          initial={editingPanel}
          onClose={() => setEditingIndex(null)}
          onSave={(next) => {
            savePanel(editingIndex, next)
            setEditingIndex(null)
          }}
          onSaveAndNext={
            isNewSentence
              ? undefined
              : (next) => {
                  savePanel(editingIndex, next)
                  setReviewed(bookId, editingRow?.key ?? next.id, true)
                  openNextAfter(editingIndex)
                }
          }
          onReset={
            !custom && editingRow?.edited
              ? () => {
                  resetSentence(bookId, editingIndex)
                  setEditingIndex(null)
                }
              : undefined
          }
        />
      ) : null}
    </div>
  )
}
