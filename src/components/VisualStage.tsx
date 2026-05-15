import type { LayerState } from '../types/pack'

type Props = {
  layers: LayerState[]
  /** 그림 위·아래에 겹쳐 보일 짧은 한글 (선택) */
  overlayCaption?: string | null
}

/**
 * 편집자·사용자 공통: 레이어 스택을 스테이지 위에 겹쳐 그린다.
 * overlayCaption이 있으면 하단에 읽기 쉬운 말풍선 스타일로 띄운다.
 * fillHeight 레이어는 세로를 꽉 채우고, plateCaption이 있으면 레이어 안 하단에 제목 막대를 둔다.
 */
export function VisualStage({ layers, overlayCaption }: Props) {
  const hasImage = layers.some((l) => l.visible && l.imageUrl)

  return (
    <div className="relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
      {layers.map((l) => {
        if (!l.visible || !l.imageUrl) return null
        const fill = l.fillHeight === true
        const plate = l.plateCaption?.trim()
        const hasPlate = Boolean(plate)

        return (
          <div
            key={l.id}
            className="absolute overflow-hidden rounded-lg shadow-xl ring-1 ring-white/15 transition-all duration-700 ease-out"
            style={{
              left: `${l.x}%`,
              width: `${l.width}%`,
              ...(fill ? { top: 0, height: '100%' } : { top: `${l.y}%` }),
              opacity: l.opacity,
              transform: `scale(${l.scale})`,
              transformOrigin: fill ? 'left center' : 'center center',
            }}
          >
            {hasPlate ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="relative min-h-0 flex-1">
                  <img
                    src={l.imageUrl}
                    alt={l.label}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="shrink-0 border-t border-white/10 bg-black/82 px-1 py-2 text-center text-[clamp(0.7rem,1.8vw,1rem)] font-bold tracking-tight text-white">
                  {plate}
                </div>
              </div>
            ) : fill ? (
              <img src={l.imageUrl} alt={l.label} className="h-full w-full object-cover" />
            ) : (
              <img src={l.imageUrl} alt={l.label} className="block h-auto w-full object-cover" />
            )}
          </div>
        )
      })}
      {!hasImage ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center text-sm text-slate-500">
          <span>아직 화면에 올라온 그림이 없어요.</span>
          <span className="text-xs text-slate-600">아래에서 「몇 글째」마다 그림을 보이게 설정해 보세요.</span>
        </div>
      ) : null}

      {overlayCaption ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-3 pb-[5%] pt-16"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, transparent 100%)',
          }}
        >
          <p
            className="max-w-[92%] text-center text-[clamp(0.95rem,2.1vw,1.35rem)] font-bold leading-snug tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
            style={{ textShadow: '0 0 1px #000, 0 1px 2px #000' }}
          >
            {overlayCaption}
          </p>
        </div>
      ) : null}
    </div>
  )
}
