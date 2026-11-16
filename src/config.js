// Fonte única de marca, URLs e contatos do app Vaultierre.
// Ao trocar para o domínio próprio, altere só aqui.
export const BRAND_NAME = 'Vaultierre'

export const API_URL = 'https://vaultierre-backend.onrender.com/api'
export const STRAPI_URL = 'https://vaultierre-cms.onrender.com'
export const SITE_URL = 'https://vaultierre-frontend.onrender.com'

export const CONTATO_EMAIL = 'contato@vaultierre.com.br'

// Instagram ainda não migrado para @vaultierre (ver PENDENCIAS no Drive).
export const INSTAGRAM_HANDLE = 'clubegole'
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`

// OAuth: IDs públicos dos apps Google/Facebook. Os atuais são os do Clube do Gole;
// trocar quando os apps Vaultierre forem criados (o secret fica só no backend).
export const GOOGLE_CLIENT_ID = '465037215980-thmlbjcja9f3eob73b305kfv3q0a8om1.apps.googleusercontent.com'
export const FACEBOOK_APP_ID = '1400421088511853'
export const GOOGLE_REDIRECT_URI = `${SITE_URL}/auth/google/callback`
export const FACEBOOK_REDIRECT_URI = `${SITE_URL}/auth/facebook/callback`
