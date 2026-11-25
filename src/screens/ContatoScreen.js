// Ajuda e contato: WhatsApp, e-mail e formulário (vai para o e-mail da Vaultierre pelo servidor).
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { msgErro } from '../utils/mascaras'
import { Tela, Cabecalho, Botao, Entrada, Lista, ItemLista, Secao, toque } from '../components/ui'
import { colors, fonts } from '../theme'
import { CONTATO_EMAIL } from '../config'

const ASSUNTOS = ['Minha assinatura', 'Entrega', 'Pagamento', 'Corporativo', 'Outro']

export default function ContatoScreen() {
  const { user } = useAuth()
  const [nome, setNome] = useState(user ? `${user.nome || ''} ${user.sobrenome || ''}`.trim() : '')
  const [email, setEmail] = useState(user?.email || '')
  const [assunto, setAssunto] = useState(ASSUNTOS[0])
  const [msg, setMsg] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar() {
    if (!nome.trim() || !email.trim() || !msg.trim()) return Alert.alert('Atenção', 'Preencha nome, e-mail e mensagem.')
    setEnviando(true)
    try {
      await api.post('/contato', { nome: nome.trim(), email: email.trim(), assunto, mensagem: msg.trim() })
      setMsg('')
      Alert.alert('Mensagem enviada', 'Respondemos em até 1 dia útil no seu e-mail.')
    } catch (e) { Alert.alert('Ops', msgErro(e, 'Não foi possível enviar agora.')) } finally { setEnviando(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela abas={false}>
        <Cabecalho eyebrow="Ajuda" titulo="Fale com a gente" />
        <Lista>
          <ItemLista icone="mensagem" titulo="WhatsApp" detalhe="Resposta rápida" onPress={() => Linking.openURL('https://api.whatsapp.com/send/?phone=5544998969986')} />
          <ItemLista icone="documento" titulo="E-mail" detalhe={CONTATO_EMAIL} onPress={() => Linking.openURL(`mailto:${CONTATO_EMAIL}`)} ultimo />
        </Lista>
        <Secao>Ou envie uma mensagem</Secao>
        <Entrada rotulo="Nome" value={nome} onChangeText={setNome} />
        <Entrada rotulo="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={st.rotulo}>Assunto</Text>
        <View style={st.chips}>
          {ASSUNTOS.map(a => (
            <TouchableOpacity key={a} onPress={() => { toque(); setAssunto(a) }} style={[st.chip, assunto === a && st.chipOn]}>
              <Text style={[st.chipT, assunto === a && { color: colors.douradoClaro }]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Entrada rotulo="Mensagem" value={msg} onChangeText={setMsg} multiline style={{ height: 120, paddingTop: 12, textAlignVertical: 'top' }} />
        <Botao titulo="Enviar mensagem" onPress={enviar} carregando={enviando} />
      </Tela>
    </KeyboardAvoidingView>
  )
}

const st = StyleSheet.create({
  rotulo: { color: colors.textoSecundario, fontFamily: fonts.uiForte, fontSize: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { borderWidth: 1, borderColor: colors.bordaCard, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipOn: { borderColor: colors.dourado },
  chipT: { color: colors.textoSecundario, fontFamily: fonts.uiMedio, fontSize: 12.5 },
})
