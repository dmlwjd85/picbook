import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = { children: ReactNode }

type State = { error: Error | null }

/** 마스터 편집 화면 — 예기치 않은 오류 시 빈 화면 대신 안내 */
export class EditorErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('EditorPage error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center">
          <p className="text-sm font-medium text-red-600">편집 화면을 불러오는 중 문제가 생겼습니다.</p>
          <p className="max-w-sm text-xs text-slate-500">{this.state.error.message}</p>
          <Link
            to="/master/login"
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white"
          >
            마스터 로그인으로
          </Link>
          <Link to="/bookshelf" className="text-xs text-slate-600 underline-offset-2 hover:underline">
            책장으로
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
