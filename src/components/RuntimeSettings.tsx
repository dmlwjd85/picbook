import { useState } from 'react'
import { useUiStore } from '../store/useUiStore'

export function RuntimeSettings() {
  const googleClientId = useUiStore((s) => s.googleClientId)
  const geminiApiKey = useUiStore((s) => s.geminiApiKey)
  const setRuntimeGoogleClientId = useUiStore((s) => s.setRuntimeGoogleClientId)
  const setRuntimeGeminiApiKey = useUiStore((s) => s.setRuntimeGeminiApiKey)
  const [clientIdDraft, setClientIdDraft] = useState(googleClientId)
  const [geminiKeyDraft, setGeminiKeyDraft] = useState(geminiApiKey)

  const hasEnvGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
  const hasEnvGeminiApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY)
  const googleReady = Boolean(googleClientId || hasEnvGoogleClientId)
  const geminiReady = Boolean(geminiApiKey || hasEnvGeminiApiKey)

  return (
    <details className="relative">
      <summary className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50">
        설정
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-[min(92vw,420px)] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl">
        <h2 className="text-sm font-semibold text-slate-900">로그인 · Nano 설정</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          GitHub Secrets가 없을 때 브라우저에 임시 저장해서 바로 테스트합니다. API Key는 이 브라우저의 localStorage에
          저장되므로 공용 PC에서는 사용 후 지우세요.
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

        <label className="mt-4 block text-xs font-semibold text-slate-700">
          Gemini API Key
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
