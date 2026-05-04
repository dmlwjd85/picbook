import { useEffect, useRef, useState } from 'react'
import { useUiStore } from '../store/useUiStore'

export function GoogleLoginButton() {
  const signInWithGoogleCredential = useUiStore((s) => s.signInWithGoogleCredential)
  const setGoogleGeminiAccessToken = useUiStore((s) => s.setGoogleGeminiAccessToken)
  const runtimeClientId = useUiStore((s) => s.googleClientId)
  const [error, setError] = useState<string | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  const clientId = runtimeClientId || envClientId

  useEffect(() => {
    let cancelled = false

    if (!clientId) {
      return
    }

    const render = () => {
      if (cancelled || !hostRef.current) return
      const googleId = window.google?.accounts?.id
      if (!googleId) return

      hostRef.current.innerHTML = ''
      googleId.initialize({
        client_id: clientId,
        callback: (response) => {
          const credential = response.credential
          if (!credential) {
            setError('구글 로그인 응답에 credential이 없습니다.')
            return
          }
          const res = signInWithGoogleCredential(credential)
          if (!res.ok) setError(res.reason)
          if (res.ok) requestGeminiAccessToken(clientId, setGoogleGeminiAccessToken, setError)
        },
      })
      googleId.renderButton(hostRef.current, {
        theme: 'outline',
        size: 'medium',
        text: 'signin_with',
        shape: 'pill',
        width: 180,
      })
      setError(null)
    }

    const timer = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        window.clearInterval(timer)
        render()
      }
    }, 200)

    window.setTimeout(() => {
      if (!window.google?.accounts?.id) {
        window.clearInterval(timer)
        setError('구글 로그인 스크립트를 불러오지 못했습니다.')
      }
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [clientId, setGoogleGeminiAccessToken, signInWithGoogleCredential])

  const visibleError = !clientId ? '상단 설정에서 Google Client ID를 먼저 저장하세요.' : error

  return (
    <div className="flex flex-col items-end gap-1">
      <div ref={hostRef} className="min-h-[32px]" />
      {visibleError ? <div className="max-w-[220px] text-right text-[11px] leading-snug text-amber-700">{visibleError}</div> : null}
    </div>
  )
}

function requestGeminiAccessToken(
  clientId: string,
  setGoogleGeminiAccessToken: (accessToken: string, expiresInSec: number) => void,
  setError: (message: string | null) => void,
) {
  const oauth2 = window.google?.accounts?.oauth2
  if (!oauth2) {
    setError('구글 OAuth 권한 요청 모듈을 불러오지 못했습니다.')
    return
  }

  const tokenClient = oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/generative-language',
    callback: (response) => {
      if (response.error || !response.access_token) {
        setError(response.error_description ?? 'Gemini 권한 승인이 필요합니다.')
        return
      }
      setGoogleGeminiAccessToken(response.access_token, response.expires_in ?? 3600)
      setError(null)
    },
  })

  tokenClient.requestAccessToken({ prompt: 'consent' })
}
