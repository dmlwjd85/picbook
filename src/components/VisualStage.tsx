import { useEffect, useState, type CSSProperties } from 'react'
import { KaraokeLyrics, KaraokeLyricsBottom } from './KaraokeLyrics'
import { VocabGlossOverlay } from './VocabGlossOverlay'
import type { LayerState, VocabGloss } from '../types/pack'

const IMG_PROPS = {
  decoding: 'async' as const,
  loading: 'eager' as const,
}

/** ? ??? ?? ?? ??? ??? ?? ??? ?? ??? ??? ??? */
function LayerPicture({
  imageUrl,
  label,
  className,
  style,
}: {
  imageUrl: string
  label: string
  className?: string
  style?: CSSProperties
}) {
  const [shownUrl, setShownUrl] = useState(imageUrl)

  useEffect(() => {
    if (imageUrl === shownUrl) return
    let cancelled = false
    const img = new Image()
    const apply = () => {
      if (!cancelled) setShownUrl(imageUrl)
    }
    img.onload = apply
    img.onerror = apply
    img.src = imageUrl
    if (img.complete) apply()
    return () => {
      cancelled = true
    }
  }, [imageUrl, shownUrl])

  return (
    <img
      src={shownUrl}
      alt={label}
      className={className}
      style={style}
      {...IMG_PROPS}
    />
  )
}

type KaraokeProps = {
  target: string
  draft: string
  committed: string
}

type Props = {
  layers: LayerState[]
  overlayCaption?: string | null
  embedded?: boolean
  /** 속담 컷 등 — 이미지를 스테이지 중앙에 맞춤 */
  centerImages?: boolean
  /** 연출 영역을 화면에 최대한 크게 */
  large?: boolean
  /** 한 화면에 맞춘 작은 연출 */
  compact?: boolean
  /** 노래방 자막 — 따라 쓸 문장을 그림 하단에만 표시 */
  karaoke?: KaraokeProps | null
  vocabGlosses?: VocabGloss[]
}

function RedXStamp() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-black/30"
      style={{ animation: 'stamp-in 0.4s ease-out' }}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-[clamp(4rem,22vw,9rem)] w-[clamp(4rem,22vw,9rem)] text-red-600 drop-shadow-[0_0_24px_rgba(220,38,38,0.85)]"
        aria-hidden
      >
        <line x1="18" y1="18" x2="82" y2="82" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
        <line x1="82" y1="18" x2="18" y2="82" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
      </svg>
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

/** ??? ?? ??. ?? ??? ?? ?????, pan??? ??? ?? ??. */
export function VisualStage({
  layers,
  overlayCaption,
  embedded = false,
  centerImages = false,
  large = false,
  compact = false,
  karaoke = null,
  vocabGlosses = [],
}: Props) {
  const visibleLayers = layers.filter((l) => l.visible && l.imageUrl)
  const hasImage = visibleLayers.length > 0

  return (
    <div
      className={
        embedded
          ? 'relative h-full w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner'
          : compact
            ? 'relative h-full w-full min-h-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner'
            : large
              ? 'relative mx-auto aspect-[4/3] h-full w-full max-h-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner'
              : 'relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner'
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
      {visibleLayers.map((l) => {
        const fill = l.fillHeight === true
        const plate = l.plateCaption?.trim()
        const hasPlate = Boolean(plate)
        const anchors = l.anchorLabels
        const panX = l.panX ?? 0
        const panY = l.panY ?? 0
        const imageUrl = l.imageUrl!
        const transformOrigin =
          l.stampOverlay === 'red-x' || (fill && !hasPlate && l.scale > 1.05)
            ? 'center 22%'
            : fill && hasPlate
              ? 'left center'
              : 'center center'
        const faceZoom = !centerImages && fill && !hasPlate && (l.scale ?? 1) > 1.02
        const proverbFill = centerImages && fill && !hasPlate
        const layoutMotion = hasPlate ? 'transition-[left,width] duration-[480ms] ease-out' : ''

        return (
          <div
            key={l.id}
            className={`absolute overflow-hidden rounded-lg shadow-xl ring-1 ring-white/15 will-change-transform ${layoutMotion}`}
            style={{
              left: `${l.x}%`,
              width: `${l.width}%`,
              zIndex: l.zIndex,
              ...(fill ? { top: 0, height: '100%' } : { top: `${l.y}%` }),
              opacity: l.opacity,
            }}
          >
            <div
              className="h-full w-full transition-transform duration-[420ms] ease-out"
              style={{ transform: `scale(${l.scale})`, transformOrigin }}
            >
              <div className="h-full w-full" style={{ transform: `translate(${panX}%, ${panY}%)` }}>
                {hasPlate ? (
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="relative min-h-0 flex-1">
                      <LayerPicture
                        imageUrl={imageUrl}
                        label={l.label}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {anchors ? <AnchorOverlay labels={anchors} /> : null}
                    </div>
                    <div className="shrink-0 border-t border-white/10 bg-black/82 px-1 py-2 text-center text-[clamp(0.7rem,1.8vw,1rem)] font-bold tracking-tight text-white">
                      {plate}
                    </div>
                  </div>
                ) : fill ? (
                  <div
                    className={
                      proverbFill
                        ? 'flex h-full w-full items-center justify-center max-lg:pt-12 lg:pt-0'
                        : 'relative h-full w-full'
                    }
                  >
                    <LayerPicture
                      imageUrl={imageUrl}
                      label={l.label}
                      className={
                        proverbFill
                          ? 'max-h-full max-w-full object-contain'
                          : 'h-full w-full object-cover'
                      }
                      style={
                        proverbFill
                          ? {
                              objectPosition: 'center center',
                              width: '100%',
                              height: '100%',
                            }
                          : faceZoom
                            ? { objectPosition: 'center 18%' }
                            : undefined
                      }
                    />
                    {anchors ? <AnchorOverlay labels={anchors} /> : null}
                    {l.stampOverlay === 'red-x' ? <RedXStamp /> : null}
                  </div>
                ) : (
                  <div className="relative w-full">
                    <LayerPicture
                      imageUrl={imageUrl}
                      label={l.label}
                      className="block h-auto w-full object-cover"
                    />
                    {anchors ? <AnchorOverlay labels={anchors} /> : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
      {!hasImage ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center text-sm text-slate-500">
          <span>아직 연출 이미지가 없습니다.</span>
          <span className="text-xs text-slate-600">따라 쓰면 장면이 바뀝니다.</span>
        </div>
      ) : null}

      <VocabGlossOverlay glosses={vocabGlosses} />

      {karaoke && !overlayCaption ? (
        <>
          <KaraokeLyrics target={karaoke.target} draft={karaoke.draft} committed={karaoke.committed} />
          <KaraokeLyricsBottom target={karaoke.target} draft={karaoke.draft} committed={karaoke.committed} />
        </>
      ) : null}

      {overlayCaption ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center justify-end px-3 pb-[5%] pt-20"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)',
          }}
        >
          <p
            className="max-w-[92%] text-center text-[clamp(1.05rem,2.5vw,1.5rem)] font-bold leading-snug tracking-tight text-amber-100"
            style={{ textShadow: '0 0 1px #000, 0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {overlayCaption}
          </p>
          <p className="mt-2 text-[11px] font-medium text-white/55">Enter → 다음 속담</p>
        </div>
      ) : null}
    </div>
  )
}
