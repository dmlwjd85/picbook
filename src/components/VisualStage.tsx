import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { isChunkLayerId } from '../lib/mergePlayLayers'
import { StageInlays } from './StageTopOverlays'
import type { LayerState, VocabGloss } from '../types/pack'
import type { SceneStaging, SceneTransition, TextOverlayPosition } from '../types/sceneEdit'

const IMG_PROPS = {
  decoding: 'async' as const,
  loading: 'eager' as const,
}

const TRANSITION_MS = 300
const transitionCls =
  'transition-[opacity,filter,transform] duration-[300ms] ease-in-out motion-reduce:transition-none'

/** 장면 전환 — 다음 이미지 로드 후 겹쳐 전환(빈 프레임 없음) */
function LayerPicture({
  imageUrl,
  label,
  className,
  style,
  sceneTransition = 'crossfade',
}: {
  imageUrl: string
  label: string
  className?: string
  style?: CSSProperties
  sceneTransition?: SceneTransition
}) {
  const [activeUrl, setActiveUrl] = useState(imageUrl)
  const [fadeOutUrl, setFadeOutUrl] = useState<string | null>(null)
  const [crossfading, setCrossfading] = useState(false)
  const isAbsolute = className?.includes('absolute')

  useEffect(() => {
    if (imageUrl === activeUrl) return
    if (sceneTransition === 'none') {
      setActiveUrl(imageUrl)
      setFadeOutUrl(null)
      setCrossfading(false)
      return
    }
    let cancelled = false
    const img = new Image()
    const beginCrossfade = () => {
      if (cancelled || imageUrl === activeUrl) return
      const prev = activeUrl
      setActiveUrl(imageUrl)
      setFadeOutUrl(prev)
      setCrossfading(false)
      requestAnimationFrame(() => {
        if (cancelled) return
        setCrossfading(true)
        window.setTimeout(() => {
          if (!cancelled) {
            setFadeOutUrl(null)
            setCrossfading(false)
          }
        }, TRANSITION_MS + 40)
      })
    }
    img.onload = beginCrossfade
    img.onerror = beginCrossfade
    img.src = imageUrl
    if (img.complete) beginCrossfade()
    return () => {
      cancelled = true
    }
  }, [imageUrl, activeUrl, sceneTransition])

  useEffect(() => {
    if (imageUrl !== activeUrl && !fadeOutUrl) setActiveUrl(imageUrl)
  }, [imageUrl, activeUrl, fadeOutUrl])

  const wrapCls = isAbsolute ? 'absolute inset-0' : 'relative w-full'
  const instant = sceneTransition === 'none'
  const slideLeft = sceneTransition === 'slide-left'
  const slideRight = sceneTransition === 'slide-right'
  const useBlur = sceneTransition === 'crossfade'

  const enterSlide = crossfading
    ? slideLeft
      ? 'translate-x-0'
      : slideRight
        ? 'translate-x-0'
        : ''
    : slideLeft
      ? 'translate-x-full'
      : slideRight
        ? '-translate-x-full'
        : ''

  const exitSlide = crossfading
    ? slideLeft
      ? '-translate-x-full opacity-0'
      : slideRight
        ? 'translate-x-full opacity-0'
        : useBlur
          ? 'opacity-0 blur-[3px]'
          : 'opacity-0'
    : useBlur
      ? 'opacity-100 blur-0'
      : 'opacity-100'

  return (
    <div className={wrapCls}>
      <img
        src={activeUrl}
        alt={label}
        className={`${className ?? ''} ${instant ? '' : transitionCls} opacity-100 ${enterSlide}`}
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
      {fadeOutUrl && !instant ? (
        <img
          src={fadeOutUrl}
          alt=""
          aria-hidden
          className={`${className ?? ''} ${transitionCls} absolute inset-0 ${exitSlide}`}
          style={style}
          draggable={false}
        />
      ) : null}
    </div>
  )
}

function stagingWrapClass(staging: SceneStaging): string {
  switch (staging) {
    case 'ken-burns':
      return 'picbook-staging-ken-burns'
    case 'soft-zoom':
      return 'picbook-staging-soft-zoom'
    case 'vignette':
      return 'picbook-staging-vignette'
    default:
      return ''
  }
}

function MasterTextOverlay({
  text,
  position,
}: {
  text: string
  position: TextOverlayPosition
}) {
  const posCls =
    position === 'top'
      ? 'top-3'
      : position === 'bottom'
        ? 'bottom-3'
        : 'top-1/2 -translate-y-1/2'
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[3] flex justify-center px-4 ${posCls}`}
    >
      <p
        className="max-w-[92%] rounded-lg bg-black/72 px-3 py-2 text-center text-[clamp(0.75rem,2.4vw,1rem)] font-bold leading-snug text-amber-50 shadow-lg ring-1 ring-white/20"
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
      >
        {text}
      </p>
    </div>
  )
}

/** visible 레이어가 잠깐 비어도 직전 장면을 깔아 검은 화면 방지 */
function StageHoldBackdrop({
  url,
  centerImages,
}: {
  url: string
  centerImages: boolean
}) {
  return (
    <img
      src={url}
      alt=""
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full ${
        centerImages ? 'object-contain' : 'object-cover'
      }`}
      style={centerImages ? { objectPosition: 'center center' } : undefined}
      draggable={false}
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
  centerImages?: boolean
  large?: boolean
  compact?: boolean
  karaoke?: KaraokeProps | null
  vocabGlosses?: VocabGloss[]
  epilogueFullscreen?: boolean
  onOverlayTap?: () => void
  overlayTapLabel?: string
  /** 마스터 연출 — 패널 전환 방식 */
  sceneTransition?: SceneTransition
  stagingEffect?: SceneStaging
  masterTextOverlay?: { text: string; position: TextOverlayPosition } | null
  /** false면 전환용 홀드 백드롭 비활성(편집기·삼분할 겹침 방지) */
  holdBackdrop?: boolean
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

/** 연출 스테이지 — 3:2 속담은 contain(전체 보기), 자막·낱말은 겹쳐 표시 */
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
  sceneTransition = 'crossfade',
  stagingEffect = 'none',
  masterTextOverlay = null,
  holdBackdrop = true,
}: Props) {
  const visibleLayers = layers.filter((l) => l.visible && l.imageUrl)
  const hasImage = visibleLayers.length > 0
  const showKaraoke = Boolean(karaoke && !overlayCaption)
  const holdUrlRef = useRef<string | null>(null)
  const topVisibleUrl = visibleLayers[visibleLayers.length - 1]?.imageUrl ?? null
  if (topVisibleUrl) holdUrlRef.current = topVisibleUrl
  const splitPanels =
    visibleLayers.filter((l) => l.fillHeight && (l.width ?? 100) < 99).length >= 2
  /** 레이어가 보일 때 백드롭을 깔면 삼분할·속담에서 이미지가 이중으로 겹침 */
  const holdUrl =
    holdBackdrop && !splitPanels && visibleLayers.length === 0 ? holdUrlRef.current : null

  const shellClass = embedded
    ? 'relative h-full w-full overflow-hidden bg-stone-900'
    : compact
      ? `relative h-full min-h-[inherit] w-full overflow-hidden bg-stone-900${
          large
            ? ' lg:mx-auto lg:aspect-[3/2] lg:h-full lg:max-h-full lg:max-w-none lg:w-full'
            : ''
        }`
      : large
        ? 'relative mx-auto aspect-[3/2] h-full w-full max-h-full max-w-none overflow-hidden bg-stone-900'
        : 'relative mx-auto aspect-[16/9] w-full max-w-none overflow-hidden bg-stone-900'

  return (
    <div className={shellClass}>
      {holdUrl ? <StageHoldBackdrop url={holdUrl} centerImages={centerImages} /> : null}
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
        /** 3:2 속담 — 잘리지 않고 전체 프레임 */
        const imgFit = proverbFill ? 'object-contain' : 'object-cover'
        const layoutMotion = hasPlate ? 'transition-[left,width] duration-[480ms] ease-out' : ''
        const chunkFade = isChunkLayerId(l.id) ? ' layer-fade-in' : ''
        const layerChrome =
          proverbFill || (fill && !hasPlate)
            ? `absolute overflow-hidden will-change-transform transition-opacity duration-300 ease-in-out${chunkFade}`
            : `absolute overflow-hidden rounded-lg shadow-xl ring-1 ring-white/15 will-change-transform transition-opacity duration-300 ease-in-out ${layoutMotion}${chunkFade}`

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
                        sceneTransition={sceneTransition}
                      />
                      {anchors ? <AnchorOverlay labels={anchors} /> : null}
                    </div>
                    <div className="shrink-0 border-t border-white/10 bg-black/82 px-1 py-2 text-center text-[clamp(0.7rem,1.8vw,1rem)] font-bold tracking-tight text-white">
                      {plate}
                    </div>
                  </div>
                ) : fill ? (
                  <div
                    className={`relative h-full w-full bg-stone-900 ${stagingWrapClass(stagingEffect)}`}
                  >
                    <div
                      className={
                        proverbFill
                          ? 'absolute inset-0 flex items-center justify-center'
                          : 'absolute inset-0'
                      }
                    >
                      <LayerPicture
                        imageUrl={imageUrl}
                        label={l.label}
                        className={`h-full w-full ${imgFit}`}
                        sceneTransition={sceneTransition}
                        style={
                          proverbFill
                            ? { objectPosition: 'center center' }
                            : faceZoom
                              ? { objectPosition: 'center 18%' }
                              : undefined
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
                      sceneTransition={sceneTransition}
                    />
                    {anchors ? <AnchorOverlay labels={anchors} /> : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
      {!hasImage && !holdUrl ? (
        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-1 px-6 text-center text-sm text-slate-400">
          <span>아직 연출 이미지가 없습니다.</span>
          <span className="text-xs text-slate-500">따라 쓰면 장면이 바뀝니다.</span>
        </div>
      ) : null}

      {masterTextOverlay?.text.trim() ? (
        <MasterTextOverlay text={masterTextOverlay.text.trim()} position={masterTextOverlay.position} />
      ) : null}

      <StageInlays glosses={vocabGlosses} karaoke={karaoke} showKaraoke={showKaraoke} />

      {overlayCaption ? (
        <>
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col items-center justify-end px-3 ${
              epilogueFullscreen ? 'pb-2 pt-16' : 'pb-2 pt-12'
            }`}
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
            }}
          >
            <p
              className={`max-w-[94%] text-center font-bold leading-snug text-amber-50 ${
                epilogueFullscreen
                  ? 'text-[clamp(1rem,4.2vw,1.3rem)]'
                  : 'text-[clamp(0.95rem,2.8vw,1.2rem)]'
              }`}
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
            >
              {overlayCaption}
            </p>
            {!epilogueFullscreen ? (
              <p className="mt-1.5 text-[11px] font-medium text-white/50">Enter → 다음 속담</p>
            ) : null}
          </div>
          {epilogueFullscreen && onOverlayTap ? (
            <div
              className="absolute inset-x-0 z-30 flex cursor-pointer justify-center px-4"
              style={{ bottom: 'max(5.25rem, calc(env(safe-area-inset-bottom) + 4.25rem))' }}
              role="button"
              tabIndex={0}
              onClick={onOverlayTap}
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
              <span className="rounded-full bg-amber-700/95 px-6 py-3 text-base font-bold text-white shadow-lg ring-2 ring-amber-400/40">
                {overlayTapLabel}
              </span>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
