import { useEffect, useState, type CSSProperties } from 'react'
import { ClosingSpeechBubble } from './ClosingSpeechBubble'
import { StageInlays } from './StageTopOverlays'
import type { LayerState, VocabGloss } from '../types/pack'

const IMG_PROPS = {
  decoding: 'async' as const,
  loading: 'eager' as const,
}

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
      draggable={false}
      {...IMG_PROPS}
      onError={(e) => {
        const el = e.currentTarget
        if (el.dataset.fallback === '1') return
        el.dataset.fallback = '1'
        el.style.opacity = '0.35'
      }}
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
  centerImages?: boolean
  large?: boolean
  compact?: boolean
  karaoke?: KaraokeProps | null
  vocabGlosses?: VocabGloss[]
  epilogueFullscreen?: boolean
  onOverlayTap?: () => void
  overlayTapLabel?: string
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

/** 연출 스테이지 — 이미지 꽉 채우고 자막·낱말은 겹쳐 표시 */
export function VisualStage({
  layers,
  overlayCaption,
  embedded = false,
  centerImages = false,
  large = false,
  compact = false,
  karaoke = null,
  vocabGlosses = [],
  epilogueFullscreen = false,
  onOverlayTap,
  overlayTapLabel = '다음 속담 →',
}: Props) {
  const visibleLayers = layers.filter((l) => l.visible && l.imageUrl)
  const hasImage = visibleLayers.length > 0
  const showKaraoke = Boolean(karaoke && !overlayCaption)

  const shellClass = embedded
    ? 'relative h-full w-full overflow-hidden bg-black'
    : compact
      ? `relative h-full min-h-[inherit] w-full overflow-hidden bg-black${
          large
            ? ' lg:mx-auto lg:aspect-[3/2] lg:h-full lg:max-h-full lg:max-w-none lg:w-full'
            : ''
        }`
      : large
        ? 'relative mx-auto aspect-[3/2] h-full w-full max-h-full max-w-none overflow-hidden bg-black'
        : 'relative mx-auto aspect-[16/9] w-full max-w-none overflow-hidden bg-black'

  return (
    <div className={shellClass}>
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
        const layerChrome =
          proverbFill || (fill && !hasPlate)
            ? 'absolute overflow-hidden will-change-transform'
            : `absolute overflow-hidden rounded-lg shadow-xl ring-1 ring-white/15 will-change-transform ${layoutMotion}`

        return (
          <div
            key={l.id}
            className={layerChrome}
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
                  <div className="relative h-full w-full">
                    <div className="absolute inset-0">
                      <LayerPicture
                        imageUrl={imageUrl}
                        label={l.label}
                        className="h-full w-full object-cover"
                        style={
                          faceZoom
                            ? { objectPosition: 'center 18%' }
                            : { objectPosition: 'center center' }
                        }
                      />
                    </div>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center text-sm text-slate-400">
          <span>아직 연출 이미지가 없습니다.</span>
          <span className="text-xs text-slate-500">따라 쓰면 장면이 바뀝니다.</span>
        </div>
      ) : null}

      <StageInlays glosses={vocabGlosses} karaoke={karaoke} showKaraoke={showKaraoke} />

      {overlayCaption ? (
        <>
          <ClosingSpeechBubble text={overlayCaption} large={epilogueFullscreen} />
          {epilogueFullscreen ? (
            <div
              className="absolute inset-0 z-30 flex cursor-pointer flex-col items-center justify-end px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
              role={onOverlayTap ? 'button' : undefined}
              tabIndex={onOverlayTap ? 0 : undefined}
              onClick={onOverlayTap ?? undefined}
              onKeyDown={
                onOverlayTap
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onOverlayTap()
                      }
                    }
                  : undefined
              }
            >
              {onOverlayTap ? (
                <span className="rounded-full bg-amber-700/95 px-6 py-3 text-base font-bold text-white shadow-lg ring-2 ring-amber-400/40">
                  {overlayTapLabel}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="pointer-events-none absolute inset-x-0 bottom-2 z-30 text-center text-[11px] font-medium text-white/50">
              Enter → 다음 속담
            </p>
          )}
        </>
      ) : null}
    </div>
  )
}
