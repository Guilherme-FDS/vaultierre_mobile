jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))
jest.mock('expo-notifications', () => ({ setNotificationHandler: jest.fn(), AndroidImportance: {} }))
import { telaDaNotificacao, TELAS_PERMITIDAS } from '../push'

const resposta = (data) => ({ notification: { request: { content: { data } } } })

describe('telaDaNotificacao', () => {
  test('abre a tela indicada quando é permitida', () => {
    expect(telaDaNotificacao(resposta({ tela: 'Assinatura' }))).toBe('Assinatura')
  })
  test('ignora telas desconhecidas e notificações sem destino', () => {
    expect(telaDaNotificacao(resposta({ tela: 'AdminSecreto' }))).toBeNull()
    expect(telaDaNotificacao(resposta({}))).toBeNull()
    expect(telaDaNotificacao(null)).toBeNull()
  })
  test('lista inclui as abas principais', () => {
    expect(TELAS_PERMITIDAS).toEqual(expect.arrayContaining(['Home', 'Assinatura', 'Perfil']))
  })
})
