// IDs públicos e redirects ficam em src/config.js. O secret fica só no backend.
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '../config'

// Monta query manualmente: URLSearchParams tem suporte incompleto no Hermes.
function query(params) {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

// O state "mobile|<returnUrl>" faz o site/servidor devolver o login para o app.
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

// Apple pela web (Android): a Apple faz POST no backend, que redireciona para o app com o token
export function buildAppleAuthUrl(cfg, returnUrl) {
  return 'https://appleid.apple.com/auth/authorize?' + query({
    client_id: cfg.client_id,
    redirect_uri: cfg.redirect_uri,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
    state: `mobile|${returnUrl}`,
  })
}

function parametro(url, nome) {
  const m = new RegExp(`[?&#]${nome}=([^&#]+)`).exec(url || '')
  return m ? decodeURIComponent(m[1]) : null
}
export const extrairCode = (url) => parametro(url, 'code')
export const extrairToken = (url) => parametro(url, 'token')
