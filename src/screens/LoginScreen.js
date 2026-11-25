// Boas-vindas e login (tela 1 — versão A aprovada): foto inteira, frase e botões.
// A foto de fundo fica em IMAGENS.boasVindas (src/theme.js) para trocar fácil.
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Platform, Alert, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import * as AppleAuthentication from 'expo-apple-authentication'
import Svg, { Path } from 'react-native-svg'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { buildGoogleAuthUrl, buildAppleAuthUrl, extrairCode, extrairToken } from '../services/oauth'
import { Botao } from '../components/ui'
import Icone from '../components/Icone'
import { colors, fonts, gradients, IMAGENS } from '../theme'

WebBrowser.maybeCompleteAuthSession()

const LogoApple = () => (
  <Svg width={15} height={18} viewBox="0 0 814 1000"><Path fill="#000" d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-156 124s-86-40-164-40c-77 0-104 41-167 41s-106-57-156-128C44 789 0 668 0 554c0-184 120-282 237-282 63 0 115 41 155 41 38 0 97-44 168-44 27 0 124 3 188 72zM549 160c29-35 50-83 50-131 0-7-1-14-2-19-48 2-104 32-138 72-27 30-52 79-52 128 0 7 1 15 2 17 3 1 8 1 13 1 43 0 97-29 127-68z" /></Svg>
)
const LogoGoogle = () => (
  <Svg width={16} height={16} viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </Svg>
)

export default function LoginScreen({ navigation, route }) {
  const { loginOAuth, loginComToken, loginAppleNativo } = useAuth()
  const insets = useSafeAreaInsets()
  const [carregando, setCarregando] = useState(false)
  const [appleNativo, setAppleNativo] = useState(false)
  const [appleWeb, setAppleWeb] = useState(null)
  const depois = route?.params?.depois   // tela para abrir depois do login (ex.: checkout)

  useEffect(() => {
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(setAppleNativo).catch(() => {})
    else api.get('/auth/apple/config').then(r => r.data?.ativo && setAppleWeb(r.data)).catch(() => {})
  }, [])

  function concluir() {
    if (depois) navigation.replace(depois.tela, depois.params)
    else navigation.goBack()
  }
  function erro(e, padrao) {
    const d = e?.response?.data?.detail
    Alert.alert('Não foi possível entrar', String(typeof d === 'string' ? d : padrao))
  }

  async function entrarGoogle() {
    const retorno = Linking.createURL('oauth')
    try {
      const r = await WebBrowser.openAuthSessionAsync(buildGoogleAuthUrl(retorno), retorno)
      if (r.type !== 'success') return
      const code = extrairCode(r.url)
      if (!code) return
      setCarregando(true)
      await loginOAuth(code, 'google')
      concluir()
    } catch (e) { erro(e, 'Tente novamente.') } finally { setCarregando(false) }
  }

  async function entrarApple() {
    try {
      if (appleNativo) {
        const c = await AppleAuthentication.signInAsync({ requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL] })
        setCarregando(true)
        await loginAppleNativo({ identityToken: c.identityToken, nome: c.fullName?.givenName, sobrenome: c.fullName?.familyName })
        return concluir()
      }
      const retorno = Linking.createURL('oauth')
      const r = await WebBrowser.openAuthSessionAsync(buildAppleAuthUrl(appleWeb, retorno), retorno)
      if (r.type !== 'success') return
      const token = extrairToken(r.url)
      if (!token) return Alert.alert('Não foi possível entrar', 'Tente novamente com a Apple.')
      setCarregando(true)
      await loginComToken(token)
      concluir()
    } catch (e) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return
      erro(e, 'Tente novamente.')
    } finally { setCarregando(false) }
  }

  return (
    <View style={st.tela}>
      <Image source={IMAGENS.boasVindas} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      <LinearGradient colors={gradients.hero} locations={[0, 0.42, 0.74]} style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={[st.fechar, { top: insets.top + 8 }]} onPress={() => navigation.goBack()} accessibilityLabel="Fechar">
        <Text style={st.fecharTxt}>✕</Text>
      </TouchableOpacity>
      <View style={[st.conteudo, { paddingBottom: insets.bottom + 26 }]}>
        <Image source={IMAGENS.selo} style={st.selo} contentFit="contain" />
        <Text style={st.titulo}>Rótulos que não chegam às <Text style={st.italico}>prateleiras.</Text></Text>
        <Text style={st.sub}>Curadoria de destilados raros, entregue todo mês na sua porta.</Text>
        {carregando ? <ActivityIndicator color={colors.dourado} style={{ marginVertical: 30 }} /> : (
          <>
            {(appleNativo || appleWeb) && <Botao tipo="branco" titulo="Continuar com Apple" icone={<LogoApple />} onPress={entrarApple} style={st.btn} />}
            <Botao tipo="contorno" titulo="Continuar com Google" icone={<LogoGoogle />} onPress={entrarGoogle} style={st.btn} />
            <TouchableOpacity onPress={() => navigation.navigate('EmailLogin', { depois })}>
              <Text style={st.link}>Entrar ou criar conta com e-mail</Text>
            </TouchableOpacity>
          </>
        )}
        <Text style={st.legal}>Ao continuar, confirmo ter 18 anos ou mais. Beba com moderação.</Text>
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  fechar: { position: 'absolute', right: 18, zIndex: 2, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  fecharTxt: { color: colors.texto, fontSize: 16 },
  conteudo: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24 },
  selo: { width: 60, height: 60, marginBottom: 18 },
  titulo: { fontFamily: fonts.serif, color: colors.texto, fontSize: 38, lineHeight: 40 },
  italico: { fontFamily: fonts.serifItalico, color: colors.douradoClaro },
  sub: { fontFamily: fonts.ui, color: '#CFC8BC', fontSize: 14, lineHeight: 21, marginTop: 12, marginBottom: 24 },
  btn: { marginBottom: 10 },
  link: { fontFamily: fonts.uiMedio, color: colors.douradoClaro, textAlign: 'center', fontSize: 14, marginTop: 6 },
  legal: { fontFamily: fonts.ui, color: '#7E776C', textAlign: 'center', fontSize: 11, marginTop: 16 },
})
