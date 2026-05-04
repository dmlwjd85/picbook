type GoogleCredentialResponse = {
  credential?: string
  select_by?: string
}

type GoogleIdConfiguration = {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

type GoogleButtonConfiguration = {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number | string
}

type GoogleAccountsId = {
  initialize: (config: GoogleIdConfiguration) => void
  renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void
  disableAutoSelect: () => void
}

type GoogleOAuthTokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

type GoogleOAuthTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: '' | 'none' | 'consent' | 'select_account' }) => void
}

type GoogleOAuthTokenClientConfig = {
  client_id: string
  scope: string
  callback: (response: GoogleOAuthTokenResponse) => void
  prompt?: '' | 'none' | 'consent' | 'select_account'
}

interface Window {
  google?: {
    accounts?: {
      id?: GoogleAccountsId
      oauth2?: {
        initTokenClient: (config: GoogleOAuthTokenClientConfig) => GoogleOAuthTokenClient
      }
    }
  }
}
