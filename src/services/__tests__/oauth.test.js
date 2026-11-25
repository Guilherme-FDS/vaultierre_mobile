import { buildGoogleAuthUrl, buildAppleAuthUrl, extrairCode, extrairToken } from '../oauth'

const RETURN_URL = 'exp://192.168.0.10:8081/--/oauth'

describe('buildGoogleAuthUrl', () => {
  const url = buildGoogleAuthUrl(RETURN_URL)
  test('aponta pro endpoint do Google com client_id e redirect do site', () => {
    expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth?')
    expect(url).toContain('client_id=88074336369-5u50dkt39rrb6v2pr0e8q1s9ra5fjq39.apps.googleusercontent.com')
    expect(url).toContain(encodeURIComponent('https://vaultierre.com.br/auth/google/callback'))
    expect(url).toContain('response_type=code')
  })
  test('inclui state mobile com returnUrl embutido', () => {
    expect(url).toContain(`state=${encodeURIComponent('mobile|' + RETURN_URL)}`)
  })
})

describe('buildAppleAuthUrl', () => {
  const url = buildAppleAuthUrl({ client_id: 'br.com.vaultierre.web', redirect_uri: 'https://api.vaultierre.com.br/api/auth/apple/callback' }, RETURN_URL)
  test('usa form_post e devolve para o app pelo state', () => {
    expect(url).toContain('https://appleid.apple.com/auth/authorize?')
    expect(url).toContain('response_mode=form_post')
    expect(url).toContain(`state=${encodeURIComponent('mobile|' + RETURN_URL)}`)
  })
})

describe('extrairToken', () => {
  test('lê o token devolvido pelo login com Apple', () => {
    expect(extrairToken('vaultierre://oauth?token=abc.def&provider=apple')).toBe('abc.def')
    expect(extrairToken('vaultierre://oauth?erro=apple')).toBeNull()
  })
})

describe('extrairCode', () => {
  test('extrai code de URL de retorno', () => {
    expect(extrairCode('exp://192.168.0.10:8081/--/oauth?code=abc123&provider=google')).toBe('abc123')
  })
  test('decodifica code percent-encoded', () => {
    expect(extrairCode('exp://x/--/oauth?code=4%2F0AbC')).toBe('4/0AbC')
  })
  test('retorna null sem code', () => {
    expect(extrairCode('exp://x/--/oauth?error=access_denied')).toBeNull()
  })
})
