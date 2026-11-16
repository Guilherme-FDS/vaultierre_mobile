// IDs públicos e redirects ficam em src/config.js. O secret fica só no backend.
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, FACEBOOK_APP_ID, FACEBOOK_REDIRECT_URI } from '../config'

// Monta query manualmente: URLSearchParams tem suporte incompleto no Hermes.
function query(params) {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

// O state "mobile|<returnUrl>" faz o OAuthCallback.vue do site devolver o code pro app
// em vez de processar o login no navegador.
export function buildGoogleAuthUrl(returnUrl) {
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + query({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: `mobile|${returnUrl}`,
  })
}

export function buildFacebookAuthUrl(returnUrl) {
  return 'https://www.facebook.com/v19.0/dialog/oauth?' + query({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    response_type: 'code',
    scope: 'email,public_profile',
    state: `mobile|${returnUrl}`,
  })
}

export function extrairCode(url) {
  const m = /[?&]code=([^&#]+)/.exec(url || '')
  return m ? decodeURIComponent(m[1]) : null
}
