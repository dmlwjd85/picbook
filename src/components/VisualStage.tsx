import type { LayerState } from '../types/pack'

type Props = {
  layers: LayerState[]
}

/**
 * 편집자·사용자 공통: 레이어 스택을 스테이지 위에 겹쳐 그린다.
 */
export function VisualStage({ layers }: Props) {
  return (
    <div className="relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
      {layers.map((l) => {
        if (!l.visible || !l.imageUrl) return null
        return (
          <div
            key={l.id}
            className="absolute overflow-hidden rounded-lg shadow-xl ring-1 ring-white/15 transition-all duration-700 ease-out"
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              width: `${l.width}%`,
              opacity: l.opacity,
              transform: `scale(${l.scale})`,
              transformOrigin: 'center center',
            }}
          >
            <img src={l.imageUrl} alt={l.label} className="block h-auto w-full object-cover" />
          </div>
        )
      })}
      {layers.every((l) => !l.visible || !l.imageUrl) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center text-sm text-slate-500">
          <span>아직 화면에 올라온 그림이 없어요.</span>
          <span className="text-xs text-slate-600">아래에서 「몇 글째」마다 그림을 보이게 설정해 보세요.</span>
        </div>
      ) : null}
    </div>
  )
}
