import type { PicbookCatalogItem } from '../../data/picbookCatalog'

type Props = {
  book: PicbookCatalogItem
  onOpen: () => void
  size?: 'md' | 'lg'
}

/** 매거진 한 권 — 표지가 정면으로 진열된 형태 */
export function MagazineCover({ book, onOpen, size = 'md' }: Props) {
  const sizeClass = size === 'lg' ? 'w-[9.5rem] sm:w-[10.5rem]' : 'w-[7.75rem] sm:w-[8.5rem]'

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative ${sizeClass} shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-950`}
    >
      <div
        className={`absolute -left-[3px] top-[6%] z-0 h-[88%] w-[5px] rounded-l-sm bg-gradient-to-b ${book.magazineTone} shadow-[inset_-1px_0_2px_rgba(0,0,0,0.35)]`}
        aria-hidden
      />
      <div className="relative z-10 aspect-[3/4] overflow-hidden rounded-[3px] bg-stone-900 shadow-[0_8px_24px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.08)_inset] ring-1 ring-black/40 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_32px_rgba(0,0,0,0.5)]">
        <img
          src={book.coverImage}
          alt=""
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-200/90">PicBook</p>
          <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow">{book.title}</p>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/20 to-transparent opacity-60"
          aria-hidden
        />
      </div>
      <p className="mt-2 line-clamp-1 text-center text-[11px] font-medium text-amber-100/80">{book.subtitle}</p>
    </button>
  )
}
