// Fonte única de marca, URLs e contatos do app Vaultierre.
// Ao trocar para o domínio próprio, altere só aqui.
export const BRAND_NAME = 'Vaultierre'

export const API_URL = 'https://api.vaultierre.com.br/api'
export const STRAPI_URL = 'https://vaultierre-cms.onrender.com'
export const SITE_URL = 'https://vaultierre.com.br'

export const CONTATO_EMAIL = 'contato@vaultierre.com.br'

// Instagram ainda não migrado para @vaultierre (ver PENDENCIAS no Drive).
export const INSTAGRAM_HANDLE = 'clubegole'
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`

// OAuth: ID público do Google da Vaultierre (o mesmo do site; o secret fica só no backend).
// O anterior era o do Clube do Gole e fazia o login com Google falhar no app.
export const GOOGLE_CLIENT_ID = '88074336369-5u50dkt39rrb6v2pr0e8q1s9ra5fjq39.apps.googleusercontent.com'
export const GOOGLE_REDIRECT_URI = `${SITE_URL}/auth/google/callback`
