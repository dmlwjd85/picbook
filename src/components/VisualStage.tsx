import type { LayerState } from '../types/pack'

const IMG_PROPS = {
  decoding: 'async' as const,
  loading: 'lazy' as const,
}

type Props = {
  layers: LayerState[]
  /** 그림 위·아래에 겹쳐 보일 짧은 한글 (선택) */
  overlayCaption?: string | null
  /** true면 부모 높이에 맞춤(모바일 고정 연출창) */
  embedded?: boolean
}

function RedXStamp() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-black/30"
      style={{ animation: 'stamp-in 0.4s ease-out' }}
    >
      <span
        className="select-none font-black leading-none text-red-600 drop-shadow-[0_0_24px_rgba(220,38,38,0.85)]"
        style={{ fontSize: 'clamp(4rem, 22vw, 9rem)' }}
        aria-hidden
      >
        ✕
      </span>
    </div>
  )
}

function AnchorOverlay({ labels }: { labels: NonNullable<LayerState['anchorLabels']> }) {
  const list = labels.filter((b) => b.text.trim())
  if (list.length === 0) return null
  return (
    <>
      {list.map((a, i) => (
        <span
          key={i}
          className="pointer-events-none absolute z-[1] whitespace-nowrap rounded bg-black/78 px-2 py-0.5 text-[clamp(0.55rem,1.4vw,0.82rem)] font-bold text-white shadow-md ring-1 ring-white/25"
          style={{
            left: `${a.leftPct}%`,
            top: `${a.topPct}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {a.text}
        </span>
      ))}
    </>
  )
}

/**
 * 편집자·사용자 공통: 레이어 스택을 스테이지 위에 겹쳐 그린다.
 * overlayCaption이 있으면 하단에 읽기 쉬운 말풍선 스타일로 띄운다.
 * fillHeight 레이어는 세로를 꽉 채우고, plateCaption이 있으면 레이어 안 하단에 제목 막대를 둔다.
 * anchorLabels가 있으면 이미지 위에 고정 라벨을 겹친다.
 */
export function VisualStage({ layers, overlayCaption, embedded = false }: Props) {
  const hasImage = layers.some((l) => l.visible && l.imageUrl)

  return (
    <div
      className={
        embedded
          ? 'relative h-full w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner'
          : 'relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner'
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
      {layers.map((l) => {
        if (!l.visible || !l.imageUrl) return null
        const fill = l.fillHeight === true
        const plate = l.plateCaption?.trim()
        const hasPlate = Boolean(plate)
        const anchors = l.anchorLabels
        const panX = l.panX ?? 0
        const panY = l.panY ?? 0
        const transformOrigin =
          l.stampOverlay === 'red-x' || (fill && !hasPlate && l.scale > 1.05)
            ? 'center 22%'
            : fill && hasPlate
              ? 'left center'
              : 'center center'
        const faceZoom = fill && !hasPlate && (l.scale ?? 1) > 1.02

        return (
          <div
            key={l.id}
            className="absolute overflow-hidden rounded-lg shadow-xl ring-1 ring-white/15 transition-[transform,opacity,left,width,top] duration-500 ease-out will-change-transform max-lg:duration-[420ms] lg:duration-700"
            style={{
              left: `${l.x}%`,
              width: `${l.width}%`,
              ...(fill ? { top: 0, height: '100%' } : { top: `${l.y}%` }),
              opacity: l.opacity,
              transform: `translate(${panX}%, ${panY}%) scale(${l.scale})`,
              transformOrigin,
            }}
          >
            {hasPlate ? (
              <div className="flex h-full min-h-0 flex-col">
                <div className="relative min-h-0 flex-1">
                  <img
                    src={l.imageUrl}
                    alt={l.label}
                    className="absolute inset-0 h-full w-full object-cover"
                    {...IMG_PROPS}
                  />
                  {anchors ? <AnchorOverlay labels={anchors} /> : null}
                </div>
                <div className="shrink-0 border-t border-white/10 bg-black/82 px-1 py-2 text-center text-[clamp(0.7rem,1.8vw,1rem)] font-bold tracking-tight text-white">
                  {plate}
                </div>
              </div>
            ) : fill ? (
              <div className="relative h-full w-full">
                <img
                  src={l.imageUrl}
                  alt={l.label}
                  className="h-full w-full object-cover"
                  style={faceZoom ? { objectPosition: 'center 18%' } : undefined}
                  {...IMG_PROPS}
                />
                {anchors ? <AnchorOverlay labels={anchors} /> : null}
                {l.stampOverlay === 'red-x' ? <RedXStamp /> : null}
              </div>
            ) : (
              <div className="relative w-full">
                <img
                  src={l.imageUrl}
                  alt={l.label}
                  className="block h-auto w-full object-cover"
                  {...IMG_PROPS}
                />
                {anchors ? <AnchorOverlay labels={anchors} /> : null}
              </div>
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
