// Checkout: plano → endereço → CPF/celular (só se faltar) → cupom → Mercado Pago.
import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useFocusEffect, CommonActions } from '@react-navigation/native'
import * as WebBrowser from 'expo-web-browser'
import api from '../services/api'
import { moeda } from '../services/dados'
import { Tela, Cabecalho, Card, Eyebrow, Titulo, Muted, Botao, Entrada, Carregando, toque } from '../components/ui'
import Icone from '../components/Icone'
import { colors, fonts } from '../theme'

const mascaraCpf = (v) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
const mascaraTel = (v) => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2')
export function cpfValido(v) {
  const d = String(v).replace(/\D/g, '').split('').map(Number)
  if (d.length !== 11 || new Set(d).size === 1) return false
  for (const n of [9, 10]) {
    const soma = d.slice(0, n).reduce((s, x, i) => s + x * (n + 1 - i), 0)
    if ((soma * 10 % 11) % 10 !== d[n]) return false
  }
  return true
}
const erroApi = (e, padrao) => {
  const d = e?.response?.data?.detail
  return Array.isArray(d) ? d.map(x => String(x.msg || '').replace(/^Value error, /, '')).join('\n') : (typeof d === 'string' ? d : padrao)
}

export default function CheckoutScreen({ navigation, route }) {
  const { produtoId, planoId } = route.params || {}
  const [produto, setProduto] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [enderecos, setEnderecos] = useState([])
  const [endereco, setEndereco] = useState(null)
  const [cpf, setCpf] = useState('')
  const [tel, setTel] = useState('')
  const [emailMp, setEmailMp] = useState('')
  const [cupom, setCupom] = useState('')
  const [cupomOk, setCupomOk] = useState(null)   // { pct, fixo, msg }
  const [prazo, setPrazo] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregarPerfil = useCallback(async () => {
    try {
      const { data } = await api.get('/configuracoes/perfil')
      setPerfil(data.usuario); setEnderecos(data.enderecos || [])
      setEndereco(e => e && (data.enderecos || []).some(x => x.id === e.id) ? e : ((data.enderecos || []).find(x => x.principal) || (data.enderecos || [])[0] || null))
      setEmailMp(m => m || data.usuario?.email || '')
    } catch { Alert.alert('Ops', 'Não foi possível carregar seus dados.') }
  }, [])
  useFocusEffect(useCallback(() => { carregarPerfil() }, [carregarPerfil]))
  useEffect(() => { api.get(`/produtos/${produtoId}`).then(r => setProduto(r.data)).catch(() => {}) }, [produtoId])

  const plano = produto?.planos?.find(p => p.id === planoId)
  const garrafas = /reserva/i.test(produto?.nome || '') ? 2 : 1
  useEffect(() => {
    setPrazo('')
    const cep = String(endereco?.cep || '').replace(/\D/g, '')
    if (cep.length !== 8) return
    api.get('/frete/cotar', { params: { cep, garrafas } }).then(r => setPrazo(`Chega em até ${r.data.mais_barata.prazo_dias + 2} dias úteis após o envio`)).catch(() => {})
  }, [endereco?.id, garrafas])

  if (!produto || !perfil) return <Carregando />
  if (!plano) return <Tela abas={false}><Muted>Plano indisponível.</Muted></Tela>

  const mensal = plano.recorrencia === 'mensal'
  const subtotal = Number(mensal ? plano.preco_base : plano.preco_total)
  const desconto = cupomOk ? (cupomOk.fixo ? Math.min(cupomOk.fixo, subtotal) : subtotal * cupomOk.pct / 100) : 0
  const total = Math.max(0, subtotal - desconto)
  const faltaCpf = !perfil.cpf, faltaTel = !perfil.telefone

  async function aplicarCupom() {
    if (!cupom.trim()) return
    try {
      const { data } = await api.post('/cupons/validar', { codigo: cupom.trim().toUpperCase() })
      if (!data.valido) { setCupomOk(null); return Alert.alert('Cupom', data.mensagem || 'Cupom inválido.') }
      setCupomOk({ pct: data.desconto_tipo === 'fixo' ? 0 : Number(data.desconto), fixo: data.desconto_tipo === 'fixo' ? Number(data.desconto_fixo) : 0, msg: data.mensagem })
    } catch { Alert.alert('Cupom', 'Não foi possível validar agora.') }
  }

  async function pagar() {
    if (!endereco) return Alert.alert('Endereço', 'Adicione um endereço de entrega.')
    if (faltaCpf && !cpfValido(cpf)) return Alert.alert('CPF', 'Confira o CPF.')
    if (faltaTel && tel.replace(/\D/g, '').length < 10) return Alert.alert('Celular', 'Informe o celular com DDD.')
    setEnviando(true)
    try {
      if (faltaCpf || faltaTel) {
        await api.put('/configuracoes/dados-compra', { ...(faltaCpf && { cpf: cpf.replace(/\D/g, '') }), ...(faltaTel && { telefone: tel.replace(/\D/g, '') }) })
      }
      // Garante 1 item deste plano no carrinho e finaliza só ele
      let { data: car } = await api.get('/carrinho/')
      let item = (car.itens || []).filter(i => i.id_plano === planoId).sort((a, b) => b.id - a.id)[0]
      if (!item) {
        await api.post('/carrinho/adicionar', { produto_id: produtoId, plano_id: planoId, quantidade: 1 })
        car = (await api.get('/carrinho/')).data
        item = (car.itens || []).filter(i => i.id_plano === planoId).sort((a, b) => b.id - a.id)[0]
      } else if (item.quantidade !== 1) {
        await api.post('/carrinho/quantidade', { item_id: item.id, quantidade: 1 })
      }
      const { data } = await api.post('/carrinho/finalizar', {
        ids: [item.id], cupom: cupomOk ? cupom.trim().toUpperCase() : null,
        id_endereco: endereco.id, email_mercado_pago: mensal ? (emailMp.trim() || null) : null,
      })
      if (data.checkout_url) await WebBrowser.openBrowserAsync(data.checkout_url)
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Tabs', params: { screen: 'Assinatura' } }] }))
      Alert.alert('Quase lá 🥃', 'Assim que o Mercado Pago confirmar o pagamento, sua assinatura aparece como ativa e você recebe um aviso.')
    } catch (e) {
      Alert.alert('Ops', erroApi(e, 'Não foi possível finalizar. Tente novamente.'))
    } finally { setEnviando(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela abas={false} contentStyle={{ paddingTop: 4 }}>
        <Cabecalho eyebrow="Finalizar" titulo={`${produto.nome} · ${mensal ? 'mensal' : 'anual'}`} />
        <Card destaque style={{ marginTop: 0 }}>
          <View style={st.linha}><Muted>{mensal ? 'Por mês' : '12 meses à vista'}</Muted><Text style={st.valor}>{moeda(subtotal)}</Text></View>
          {desconto ? <View style={st.linha}><Muted style={{ color: colors.sucesso }}>Desconto</Muted><Text style={[st.valor, { color: colors.sucesso }]}>− {moeda(desconto)}</Text></View> : null}
          <View style={st.linha}><Muted>Frete</Muted><Text style={[st.valor, { color: colors.sucesso }]}>Grátis</Text></View>
          {prazo ? <Muted style={{ fontSize: 11.5, marginTop: 2 }}>{prazo}</Muted> : null}
          <View style={[st.linha, st.total]}><Text style={st.totalT}>Total</Text><Titulo tamanho={26}>{moeda(total)}</Titulo></View>
          {mensal && desconto ? <Muted style={{ fontSize: 11 }}>Cupom vale na primeira mensalidade.</Muted> : null}
        </Card>

        <Eyebrow style={{ marginTop: 20, marginBottom: 6 }}>Entrega</Eyebrow>
        {enderecos.map(e => (
          <TouchableOpacity key={e.id} activeOpacity={0.85} onPress={() => { toque(); setEndereco(e) }} style={[st.end, endereco?.id === e.id && st.endOn]}>
            <View style={[st.radio, endereco?.id === e.id && st.radioOn]} />
            <View style={{ flex: 1 }}><Text style={st.endT}>{e.endereco}, {e.numero}</Text><Muted>{e.bairro} · {e.cidade}/{e.estado}</Muted></View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => navigation.navigate('EnderecoForm')} style={st.novo}><Icone nome="pin" tamanho={18} /><Text style={st.novoT}>Adicionar endereço</Text></TouchableOpacity>

        {faltaCpf || faltaTel ? <Eyebrow style={{ marginTop: 20, marginBottom: 6 }}>Para a nota fiscal e a entrega</Eyebrow> : null}
        {faltaCpf ? <Entrada rotulo="CPF" value={cpf} onChangeText={v => setCpf(mascaraCpf(v))} placeholder="000.000.000-00" keyboardType="number-pad" maxLength={14} /> : null}
        {faltaTel ? <Entrada rotulo="Celular com DDD" value={tel} onChangeText={v => setTel(mascaraTel(v))} placeholder="(00) 00000-0000" keyboardType="phone-pad" maxLength={15} /> : null}

        {mensal ? (
          <>
            <Eyebrow style={{ marginTop: 14, marginBottom: 6 }}>Assinatura no cartão</Eyebrow>
            <Entrada rotulo="E-mail da sua conta Mercado Pago" value={emailMp} onChangeText={setEmailMp} autoCapitalize="none" keyboardType="email-address" />
            <Muted style={{ marginTop: -8, marginBottom: 6, fontSize: 11.5 }}>A cobrança mensal é autorizada na conta Mercado Pago com este e-mail. Cancele quando quiser pelo app.</Muted>
          </>
        ) : null}

        <Eyebrow style={{ marginTop: 14, marginBottom: 6 }}>Cupom ou código de indicação</Eyebrow>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}><Entrada value={cupom} onChangeText={(v) => { setCupom(v); setCupomOk(null) }} placeholder="CÓDIGO" autoCapitalize="characters" /></View>
          <Botao tipo="contorno" titulo="Aplicar" onPress={aplicarCupom} style={{ height: 50 }} />
        </View>
        {cupomOk ? <Muted style={{ color: colors.sucesso, marginTop: -6 }}>{cupomOk.msg}</Muted> : null}

        <Botao titulo={mensal ? 'Autorizar assinatura' : 'Ir para pagamento'} onPress={pagar} carregando={enviando} style={{ marginTop: 22 }} />
        <Muted style={{ textAlign: 'center', marginTop: 10, fontSize: 11 }}>Pagamento seguro pelo Mercado Pago · Cancele quando quiser</Muted>
      </Tela>
    </KeyboardAvoidingView>
  )
}

const st = StyleSheet.create({
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  valor: { color: colors.texto, fontFamily: fonts.uiMedio, fontSize: 14 },
  total: { borderTopWidth: 1, borderTopColor: colors.linhaSutil, paddingTop: 10, marginTop: 10 },
  totalT: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 15 },
  end: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.fundoSecundario, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: 14, padding: 14, marginBottom: 8 },
  endOn: { borderColor: colors.dourado },
  endT: { color: colors.texto, fontFamily: fonts.uiMedio, fontSize: 14 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#5A544C' },
  radioOn: { borderColor: colors.douradoClaro, backgroundColor: colors.douradoClaro },
  novo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  novoT: { color: colors.douradoClaro, fontFamily: fonts.uiMedio, fontSize: 13.5 },
})
