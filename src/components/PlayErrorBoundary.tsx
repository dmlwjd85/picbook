import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = { children: ReactNode }

type State = { error: Error | null }

export class PlayErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('PlayPage error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-stone-100 px-6 text-center">
          <p className="text-sm font-medium text-red-600">책을 실행하는 중 문제가 생겼습니다.</p>
          <p className="max-w-sm text-xs text-stone-500">{this.state.error.message}</p>
          <Link to="/bookshelf" className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-bold text-white">
            책장으로
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
