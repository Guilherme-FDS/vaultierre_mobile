// Notificações push (Expo). O token do aparelho vai para o backend em /push/registrar.
// Precisa de um projeto EAS (extra.eas.projectId no app.json) e de um build de desenvolvimento
// ou de produção: o Expo Go no Android não recebe push remoto desde a SDK 53.
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'

// Mostra a notificação mesmo com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
})

export const projectId = () =>
  Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? null

// Telas do app que uma notificação pode abrir (data.tela)
export const TELAS_PERMITIDAS = ['Home', 'Assinatura', 'Comunidade', 'Perfil', 'MeusPedidos', 'Blog']

export function telaDaNotificacao(resposta) {
  const tela = resposta?.notification?.request?.content?.data?.tela
  return TELAS_PERMITIDAS.includes(tela) ? tela : null
}

export async function registrarPush() {
  try {
    if (!Device.isDevice) return null                 // simulador não recebe push
    const id = projectId()
    if (!id) { console.log('[push] sem projectId do EAS — rode "eas init"'); return null }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Vaultierre', importance: Notifications.AndroidImportance.DEFAULT, lightColor: '#C9A84C',
      })
    }
    let { status } = await Notifications.getPermissionsAsync()
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status
    if (status !== 'granted') return null

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: id })
    await api.post('/push/registrar', { token, plataforma: Platform.OS })
    await AsyncStorage.setItem('push_token', token)
    return token
  } catch (e) {
    console.log('[push] não registrado:', e?.message)    // nunca atrapalha o login
    return null
  }
}

export async function removerPush() {
  try {
    const token = await AsyncStorage.getItem('push_token')
    if (token) await api.post('/push/remover', { token })
    await AsyncStorage.removeItem('push_token')
  } catch { /* sem rede: o backend desativa quando a Expo avisar */ }
}
