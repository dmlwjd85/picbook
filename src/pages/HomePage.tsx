import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">PicBook</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">타자 기반 이미지 독서 팩</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          개발자가 배포한 팩을 실행하면 문장이 한 줄씩 제시되고, 타이핑 진행에 맞춰 화면이 등장·변화합니다.
          독서 과정을 화면으로 보여 주고, 단어의 연결과 작용을 시각화하는 것이 목표입니다.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/editor"
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">편집자용</h2>
            <p className="mt-2 text-sm text-slate-600">
              문장·이미지 레이어·타이밍(몇 글자에서 무엇이 일어날지)을 구성하고 JSON 팩으로 보냅니다.
            </p>
          </Link>
          <Link
            to="/player"
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">사용자용</h2>
            <p className="mt-2 text-sm text-slate-600">
              배포된 팩 파일을 열고, 문장을 따라 타자하며 편집된 화면을 봅니다.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
