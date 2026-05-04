export function requestGeminiAccessToken(input: {
  clientId: string
  onSuccess: (accessToken: string, expiresInSec: number) => void
  onError: (message: string) => void
}) {
  const oauth2 = window.google?.accounts?.oauth2
  if (!oauth2) {
    input.onError('구글 OAuth 권한 요청 모듈을 불러오지 못했습니다.')
    return
  }

  const tokenClient = oauth2.initTokenClient({
    client_id: input.clientId,
    scope: 'https://www.googleapis.com/auth/generative-language',
    callback: (response) => {
      if (response.error || !response.access_token) {
        input.onError(response.error_description ?? 'Gemini 권한 승인이 필요합니다.')
        return
      }
      input.onSuccess(response.access_token, response.expires_in ?? 3600)
    },
  })

  tokenClient.requestAccessToken({ prompt: 'consent' })
}
