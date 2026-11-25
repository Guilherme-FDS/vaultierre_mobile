// Conta (tela 6 aprovada): cartão de membro + opções por seção. Inclui sair e excluir conta.
import React from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import * as WebBrowser from 'expo-web-browser'
import { useAuth } from '../context/AuthContext'
import { useMinhaConta } from '../services/dados'
import { Tela, Titulo, Muted, Eyebrow, Secao, Lista, ItemLista, Botao } from '../components/ui'
import { colors, fonts, IMAGENS } from '../theme'
import { SITE_URL } from '../config'

const mesAno = (iso) => iso ? new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('. de ', '/').replace(' de ', '/') : ''

export default function ContaScreen({ navigation }) {
  const { user, logout, excluirConta } = useAuth()
  const { assinatura, perfil } = useMinhaConta()
  const abrir = (tela) => navigation.navigate(tela)
  const web = (caminho) => WebBrowser.openBrowserAsync(`${SITE_URL}${caminho}`)

  function sair() {
    Alert.alert('Sair da conta?', undefined, [{ text: 'Voltar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: logout }])
  }
  function excluir() {
    Alert.alert('Excluir sua conta?', 'Sua assinatura é cancelada, seus dados pessoais são apagados e não dá para desfazer. Pedidos já pagos ficam guardados sem identificação, por obrigação fiscal.', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Excluir conta', style: 'destructive', onPress: async () => {
        try { await excluirConta(); Alert.alert('Conta excluída', 'Sentiremos sua falta.') }
        catch { Alert.alert('Ops', 'Não foi possível excluir agora. Tente de novo ou fale com o suporte.') }
      } },
    ])
  }

  const nome = perfil ? `${perfil.nome} ${perfil.sobrenome || ''}`.trim() : (user?.nome || '')
  return (
    <Tela>
      {user ? (
        <LinearGradient colors={['#2B241A', '#15120D', '#2B241A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.cartao}>
          <Image source={IMAGENS.selo} style={st.seloFundo} contentFit="contain" />
          <Eyebrow>Membro Vaultierre</Eyebrow>
          <Titulo tamanho={26} style={{ marginTop: 6 }}>{nome}</Titulo>
          <View style={{ marginTop: 'auto' }}>
            <Text style={st.numero}>Nº {String(user.id || 0).padStart(4, '0')}{assinatura?.produto ? ` · ${assinatura.produto.toUpperCase()}` : ''}</Text>
            {assinatura?.data_inicio ? <Muted style={{ fontSize: 10.5 }}>desde {mesAno(assinatura.data_inicio)}</Muted> : null}
          </View>
        </LinearGradient>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Titulo tamanho={34}>Conta</Titulo>
          <Muted style={{ marginTop: 6, marginBottom: 14 }}>Entre para ver sua assinatura, pedidos e indicações.</Muted>
          <Botao titulo="Entrar ou criar conta" onPress={() => abrir('Login')} />
        </View>
      )}

      {user ? (
        <>
          <Secao>Clube</Secao>
          <Lista>
            <ItemLista icone="presente" titulo="Indique e ganhe" onPress={() => abrir('Indique')} />
            <ItemLista icone="bussola" titulo="Perfil de paladar" onPress={() => web('/quiz?utm_source=app')} ultimo />
          </Lista>
          <Secao>Dados</Secao>
          <Lista>
            <ItemLista icone="conta" titulo="Meus dados" onPress={() => abrir('EditarPerfil')} />
            <ItemLista icone="pin" titulo="Endereços" onPress={() => abrir('Enderecos')} />
            <ItemLista icone="cadeado" titulo="Segurança" onPress={() => abrir('Seguranca')} ultimo />
          </Lista>
        </>
      ) : null}

      <Secao>Suporte</Secao>
      <Lista>
        <ItemLista icone="livro" titulo="Sobre o clube" onPress={() => abrir('Sobre')} />
        <ItemLista icone="ajuda" titulo="Perguntas frequentes" onPress={() => abrir('FAQ')} />
        <ItemLista icone="mensagem" titulo="Ajuda e contato" onPress={() => abrir('Contato')} />
        <ItemLista icone="caixa" titulo="Envio e devoluções" onPress={() => abrir('EnvioDevolucoes')} />
        <ItemLista icone="documento" titulo="Privacidade e termos" onPress={() => web('/privacidade')} ultimo />
      </Lista>

      {user ? (
        <View style={st.rodape}>
          <TouchableOpacity onPress={sair}><Text style={st.rodapeTxt}>Sair</Text></TouchableOpacity>
          <Text style={st.rodapeTxt}>·</Text>
          <TouchableOpacity onPress={excluir}><Text style={[st.rodapeTxt, { color: colors.erro }]}>Excluir conta</Text></TouchableOpacity>
        </View>
      ) : null}
      <Muted style={{ textAlign: 'center', marginTop: 10, fontSize: 10.5 }}>Venda proibida para menores de 18 anos. Beba com moderação.</Muted>
    </Tela>
  )
}

const st = StyleSheet.create({
  cartao: { height: 180, borderRadius: 20, padding: 18, marginTop: 10, borderWidth: 1, borderColor: 'rgba(226,192,106,0.45)', overflow: 'hidden' },
  seloFundo: { position: 'absolute', right: -26, bottom: -26, width: 140, height: 140, opacity: 0.35 },
  numero: { color: colors.textoSecundario, fontFamily: fonts.uiMedio, fontSize: 11, letterSpacing: 3 },
  rodape: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 22 },
  rodapeTxt: { color: colors.textoSecundario, fontFamily: fonts.uiMedio, fontSize: 13 },
})
