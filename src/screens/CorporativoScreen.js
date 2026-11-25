// Presentes corporativos: estimativa na hora e pedido de orçamento (mesmo fluxo do site).
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { Image } from 'expo-image'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { moeda } from '../services/dados'
import { msgErro } from '../utils/mascaras'
import { Tela, Titulo, Muted, Eyebrow, Card, Botao, Entrada, toque } from '../components/ui'
import { colors, fonts, IMAGENS } from '../theme'

export default function CorporativoScreen() {
  const { user } = useAuth()
  const [f, setF] = useState({ empresa: '', nome: user?.nome || '', email: user?.email || '', telefone: '', quantidade: '20', garrafas: 1 })
  const [est, setEst] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const muda = (k) => (v) => setF(x => ({ ...x, [k]: v }))
  const qtd = parseInt(f.quantidade, 10) || 0

  useEffect(() => {
    if (qtd < 10) { setEst(null); return }
    const t = setTimeout(() => api.get('/leads/b2b/estimativa', { params: { quantidade: qtd, garrafas: f.garrafas } }).then(r => setEst(r.data)).catch(() => setEst(null)), 300)
    return () => clearTimeout(t)
  }, [qtd, f.garrafas])

  async function enviar() {
    if (!f.empresa.trim() || !f.nome.trim() || !f.email.trim()) return Alert.alert('Atenção', 'Preencha empresa, nome e e-mail.')
    if (qtd < 10) return Alert.alert('Atenção', 'O pedido mínimo é de 10 kits.')
    setEnviando(true)
    try {
      await api.post('/leads/b2b', { empresa: f.empresa.trim(), nome: f.nome.trim(), email: f.email.trim(), telefone: f.telefone || null, quantidade: qtd, garrafas: f.garrafas, origem: 'app' })
      Alert.alert('Orçamento enviado', 'A curadoria entra em contato em até 1 dia útil.')
    } catch (e) { Alert.alert('Ops', msgErro(e, 'Não foi possível enviar.')) } finally { setEnviando(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela abas={false} contentStyle={{ paddingHorizontal: 0 }}>
        <Image source={IMAGENS.edicoes[2]} style={{ height: 200, width: '100%' }} contentFit="cover" />
        <View style={{ paddingHorizontal: 18 }}>
          <Eyebrow style={{ marginTop: 18 }}>Presentes corporativos</Eyebrow>
          <Titulo tamanho={30}>Um presente que ninguém esquece</Titulo>
          <Muted style={{ marginTop: 8, lineHeight: 20 }}>Kits de destilados raros para clientes e equipes, com caixa numerada e cartão de degustação. A partir de 10 kits.</Muted>
          <Card destaque>
            <Eyebrow>Simule</Eyebrow>
            <View style={st.seg}>
              {[1, 2].map(g => (
                <TouchableOpacity key={g} onPress={() => { toque(); muda('garrafas')(g) }} style={[st.segI, f.garrafas === g && st.segOn]}>
                  <Text style={[st.segT, f.garrafas === g && { color: colors.texto }]}>{g} garrafa{g > 1 ? 's' : ''} por kit</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Entrada rotulo="Quantidade de kits" value={f.quantidade} onChangeText={v => muda('quantidade')(v.replace(/\D/g, ''))} keyboardType="number-pad" />
            {est ? (
              <>
                <View style={st.linha}><Muted>{moeda(est.preco_kit)} por kit</Muted><Titulo tamanho={26}>{moeda(est.total)}</Titulo></View>
                <Muted style={{ fontSize: 11.5 }}>Estimativa · faixa {est.faixa}. A proposta final vem da curadoria.</Muted>
              </>
            ) : <Muted>Pedido mínimo de 10 kits.</Muted>}
          </Card>
          <Entrada rotulo="Empresa" value={f.empresa} onChangeText={muda('empresa')} />
          <Entrada rotulo="Seu nome" value={f.nome} onChangeText={muda('nome')} />
          <Entrada rotulo="E-mail" value={f.email} onChangeText={muda('email')} autoCapitalize="none" keyboardType="email-address" />
          <Entrada rotulo="WhatsApp (opcional)" value={f.telefone} onChangeText={muda('telefone')} keyboardType="phone-pad" />
          <Botao titulo="Pedir orçamento" onPress={enviar} carregando={enviando} />
        </View>
      </Tela>
    </KeyboardAvoidingView>
  )
}

const st = StyleSheet.create({
  seg: { flexDirection: 'row', backgroundColor: colors.fundo, borderRadius: 12, padding: 3, marginVertical: 12 },
  segI: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segOn: { backgroundColor: colors.superficie2 },
  segT: { color: colors.textoSecundario, fontFamily: fonts.uiForte, fontSize: 12 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
