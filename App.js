import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DarkTheme, createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts, CormorantGaramond_400Regular_Italic, CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond'
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { AuthProvider } from './src/context/AuthContext'
import { telaDaNotificacao } from './src/services/push'
import { colors, fonts } from './src/theme'
import AgeGate from './src/components/AgeGate'
import TabBar from './src/components/TabBar'
import InicioScreen from './src/screens/InicioScreen'
import ClubeScreen from './src/screens/ClubeScreen'
import AdegaScreen from './src/screens/AdegaScreen'
import AssinaturaScreen from './src/screens/AssinaturaScreen'
import ContaScreen from './src/screens/ContaScreen'
import LoginScreen from './src/screens/LoginScreen'
import EmailLoginScreen from './src/screens/EmailLoginScreen'
import CheckoutScreen from './src/screens/CheckoutScreen'
import RevelacaoScreen from './src/screens/RevelacaoScreen'
import IndiqueScreen from './src/screens/IndiqueScreen'
import EnderecoFormScreen from './src/screens/EnderecoFormScreen'
import EditarPerfilScreen from './src/screens/EditarPerfilScreen'
import EnderecosScreen from './src/screens/EnderecosScreen'
import SegurancaScreen from './src/screens/SegurancaScreen'
import MeusPedidosScreen from './src/screens/MeusPedidosScreen'
import SobreScreen from './src/screens/SobreScreen'
import FAQScreen from './src/screens/FAQScreen'
import BlogScreen from './src/screens/BlogScreen'
import BlogPostScreen from './src/screens/BlogPostScreen'
import ContatoScreen from './src/screens/ContatoScreen'
import CorporativoScreen from './src/screens/CorporativoScreen'
import EnvioDevolucoesScreen from './src/screens/EnvioDevolucoesScreen'
import PoliticaReembolsoScreen from './src/screens/PoliticaReembolsoScreen'

SplashScreen.preventAutoHideAsync().catch(() => {})

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()
const navegacao = createNavigationContainerRef()
const TABS = ['Inicio', 'Clube', 'Adega', 'Assinatura', 'Conta']
const ALIAS = { Home: 'Inicio', Perfil: 'Conta' }   // telas de notificações antigas

// Toque numa notificação: abre a tela indicada em data.tela
function abrirTela(tela) {
  const alvo = ALIAS[tela] || tela
  if (!alvo || !navegacao.isReady()) return
  if (TABS.includes(alvo)) navegacao.navigate('Tabs', { screen: alvo })
  else navegacao.navigate(alvo)
}

const tema = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.fundo, card: colors.fundo, text: colors.texto, primary: colors.dourado, border: colors.bordaCard, notification: colors.dourado },
}

const cabecalho = {
  headerStyle: { backgroundColor: colors.fundo },
  headerTintColor: colors.douradoClaro,
  headerTitleStyle: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 16 },
  headerShadowVisible: false,
  headerBackTitle: 'Voltar',
  contentStyle: { backgroundColor: colors.fundo },
}

function Tabs() {
  return (
    <Tab.Navigator tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.fundo } }}>
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: '' }} />
      <Tab.Screen name="Clube" component={ClubeScreen} />
      <Tab.Screen name="Adega" component={AdegaScreen} />
      <Tab.Screen name="Assinatura" component={AssinaturaScreen} />
      <Tab.Screen name="Conta" component={ContaScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [idadeVerificada, setIdadeVerificada] = useState(null) // null = carregando
  const [telaPendente, setTelaPendente] = useState(null)
  const [fontesOk] = useFonts({ CormorantGaramond_400Regular_Italic, CormorantGaramond_500Medium, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold })

  useEffect(() => {
    AsyncStorage.getItem('age_verified').then(v => setIdadeVerificada(v === 'true')).catch(() => setIdadeVerificada(false))
    // app aberto pela notificação (estava fechado) e toques com o app em uso
    Notifications.getLastNotificationResponseAsync().then(r => setTelaPendente(telaDaNotificacao(r))).catch(() => {})
    const sub = Notifications.addNotificationResponseReceivedListener(r => abrirTela(telaDaNotificacao(r)))
    return () => sub.remove()
  }, [])

  const pronto = fontesOk && idadeVerificada !== null
  const aoMontar = useCallback(() => { if (pronto) SplashScreen.hideAsync().catch(() => {}) }, [pronto])
  if (!pronto) return null

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.fundo }} onLayout={aoMontar}>
        <StatusBar style="light" />
        {!idadeVerificada ? (
          <AgeGate onConfirmar={async () => {
            try { await AsyncStorage.setItem('age_verified', 'true') } catch {}
            setIdadeVerificada(true)
          }} />
        ) : (
          <AuthProvider>
            <NavigationContainer theme={tema} ref={navegacao} onReady={() => { abrirTela(telaPendente); setTelaPendente(null) }}>
              <Stack.Navigator screenOptions={cabecalho}>
                <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
                <Stack.Screen name="EmailLogin" component={EmailLoginScreen} options={{ title: '' }} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: '' }} />
                <Stack.Screen name="Revelacao" component={RevelacaoScreen} options={{ title: '' }} />
                <Stack.Screen name="Indique" component={IndiqueScreen} options={{ title: '' }} />
                <Stack.Screen name="EnderecoForm" component={EnderecoFormScreen} options={{ title: '', presentation: 'modal' }} />
                <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: '' }} />
                <Stack.Screen name="Enderecos" component={EnderecosScreen} options={{ title: '' }} />
                <Stack.Screen name="Seguranca" component={SegurancaScreen} options={{ title: '' }} />
                <Stack.Screen name="MeusPedidos" component={MeusPedidosScreen} options={{ title: '' }} />
                <Stack.Screen name="Sobre" component={SobreScreen} options={{ title: '' }} />
                <Stack.Screen name="FAQ" component={FAQScreen} options={{ title: '' }} />
                <Stack.Screen name="Blog" component={BlogScreen} options={{ title: '' }} />
                <Stack.Screen name="BlogPost" component={BlogPostScreen} options={{ title: '' }} />
                <Stack.Screen name="Contato" component={ContatoScreen} options={{ title: '' }} />
                <Stack.Screen name="Corporativo" component={CorporativoScreen} options={{ title: '' }} />
                <Stack.Screen name="EnvioDevolucoes" component={EnvioDevolucoesScreen} options={{ title: '' }} />
                <Stack.Screen name="PoliticaReembolso" component={PoliticaReembolsoScreen} options={{ title: '' }} />
              </Stack.Navigator>
            </NavigationContainer>
          </AuthProvider>
        )}
      </View>
    </SafeAreaProvider>
  )
}
