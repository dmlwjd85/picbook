import { useState } from 'react'
import { useUiStore } from '../store/useUiStore'

export function RuntimeSettings() {
  const googleClientId = useUiStore((s) => s.googleClientId)
  const geminiApiKey = useUiStore((s) => s.geminiApiKey)
  const geminiAccessToken = useUiStore((s) => s.geminiAccessToken)
  const geminiAccessTokenExpiresAt = useUiStore((s) => s.geminiAccessTokenExpiresAt)
  const setRuntimeGoogleClientId = useUiStore((s) => s.setRuntimeGoogleClientId)
  const setRuntimeGeminiApiKey = useUiStore((s) => s.setRuntimeGeminiApiKey)
  const [clientIdDraft, setClientIdDraft] = useState(googleClientId)
  const [geminiKeyDraft, setGeminiKeyDraft] = useState(geminiApiKey)

  const hasEnvGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
  const hasEnvGeminiApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY)
  const googleReady = Boolean(googleClientId || hasEnvGoogleClientId)
  const googleGeminiReady = Boolean(geminiAccessToken && geminiAccessTokenExpiresAt > 0)
  const geminiReady = Boolean(geminiApiKey || hasEnvGeminiApiKey || googleGeminiReady)

  return (
    <details className="relative">
      <summary className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50">
        설정
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-[min(92vw,420px)] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl">
        <h2 className="text-sm font-semibold text-slate-900">로그인 · Nano 설정</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          구글 로그인 후 Gemini 권한을 승인하면 API Key를 직접 입력하지 않아도 Nano Banana를 호출합니다. API Key 입력은
          OAuth가 막힌 환경에서만 쓰는 보조 경로입니다.
        </p>

        <label className="mt-4 block text-xs font-semibold text-slate-700">
          Google Client ID
          <input
            value={clientIdDraft}
            onChange={(e) => setClientIdDraft(e.target.value)}
            placeholder="xxxxx.apps.googleusercontent.com"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-2 flex items-center justify-between gap-2">
          <StatusText ready={googleReady} readyText="구글 로그인 준비됨" emptyText="구글 로그인 미설정" />
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            onClick={() => setRuntimeGoogleClientId(clientIdDraft)}
          >
            Client ID 저장
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-700">구글 로그인 기반 Nano 권한</div>
          <StatusText
            ready={googleGeminiReady}
            readyText="구글 로그인으로 Nano 권한 연결됨"
            emptyText="구글 로그인 후 권한 승인 필요"
          />
        </div>

        <label className="mt-4 block text-xs font-semibold text-slate-700">
          Gemini API Key (보조)
          <input
            value={geminiKeyDraft}
            onChange={(e) => setGeminiKeyDraft(e.target.value)}
            placeholder="AI..."
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-2 flex items-center justify-between gap-2">
          <StatusText ready={geminiReady} readyText="Nano Banana 생성 준비됨" emptyText="Gemini API Key 미설정" />
          <button
            type="button"
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
            onClick={() => setRuntimeGeminiApiKey(geminiKeyDraft)}
          >
            API Key 저장
          </button>
        </div>
      </div>
    </details>
  )
}

function StatusText({ ready, readyText, emptyText }: { ready: boolean; readyText: string; emptyText: string }) {
  return (
    <span className={['text-[11px] font-semibold', ready ? 'text-emerald-700' : 'text-amber-700'].join(' ')}>
      {ready ? readyText : emptyText}
    </span>
  )
}
