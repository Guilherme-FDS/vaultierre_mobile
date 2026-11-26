// Assinatura (tela 4 aprovada: resumo em cards). Status, próxima cobrança, entrega, pedidos e ações.
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity, RefreshControl, ActionSheetIOS, Platform } from 'react-native'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useMinhaConta, ROTULO_STATUS, corStatus, dataLonga, moeda } from '../services/dados'
import { Tela, Cabecalho, Eyebrow, Titulo, Muted, Card, SeloAtivo, Lista, ItemLista, Vazio, Carregando, toque } from '../components/ui'
import { colors, fonts } from '../theme'

const PLANO = { mensal: 'mensal', anual: 'anual', semestral: 'semestral' }
const TIPO_PAUSA = { pulo: 'Edição pulada', pausa: 'Pausa', adiamento: 'Edição adiada' }
const STATUS_PEDIDO = { pago: 'pago', pendente: 'aguardando pagamento', cancelado: 'cancelado', estornado: 'estornado' }
const mesAno = (iso) => { const t = new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' '); return t.charAt(0).toUpperCase() + t.slice(1) }

export default function AssinaturaScreen({ navigation }) {
  const { user } = useAuth()
  const { carregando, assinatura: a, pedidos, enderecos, recarregar } = useMinhaConta()
  const [produtos, setProdutos] = useState([])
  const [opc, setOpc] = useState(null)
  useEffect(() => { api.get('/produtos/').then(r => setProdutos(r.data)).catch(() => {}) }, [])
  useEffect(() => {
    if (a?.id && a.status === 'ativa') api.get(`/assinaturas/${a.id}/opcoes`).then(r => setOpc(r.data)).catch(() => setOpc(null))
    else setOpc(null)
  }, [a?.id, a?.status, a?.proximo_ciclo])
  const atualizar = () => { recarregar(); if (a?.id) api.get(`/assinaturas/${a.id}/opcoes`).then(r => setOpc(r.data)).catch(() => {}) }

  if (!user) return (
    <Tela><Cabecalho eyebrow="Assinatura" titulo="Sua assinatura" />
      <Vazio icone="assinatura" titulo="Você ainda não é membro" texto="Entre na sua conta para ver sua assinatura e seus pedidos, ou conheça os planos."
        acao="Entrar" onAcao={() => navigation.navigate('Login')} />
      <TouchableOpacity onPress={() => navigation.navigate('Clube')}><Text style={st.link}>Conhecer os planos</Text></TouchableOpacity>
    </Tela>
  )
  if (carregando) return <Carregando />
  if (!a) return (
    <Tela><Cabecalho eyebrow="Assinatura" titulo="Sua assinatura" />
      <Vazio icone="clube" titulo="Nenhuma assinatura ativa" texto="Escolha o Essencial ou o Reserva e receba rótulos raros todo mês." acao="Ver os planos" onAcao={() => navigation.navigate('Clube')} />
      {pedidos.length ? <Pedidos pedidos={pedidos} navigation={navigation} /> : null}
    </Tela>
  )

  const outro = produtos.find(p => p.id !== a.id_produto && p.ativo !== false)

  function trocarEndereco() {
    if (!enderecos.length) return navigation.navigate('EnderecoForm')
    const nomes = enderecos.map(e => `${e.endereco}, ${e.numero} — ${e.cidade}`)
    const escolher = async (i) => {
      if (i == null || i >= enderecos.length) return
      try { await api.put(`/assinaturas/${a.id}/endereco`, { id_endereco: enderecos[i].id }); recarregar() }
      catch { Alert.alert('Ops', 'Não foi possível trocar o endereço.') }
    }
    if (Platform.OS === 'ios') ActionSheetIOS.showActionSheetWithOptions({ options: [...nomes, 'Cancelar'], cancelButtonIndex: nomes.length, title: 'Entregar em' }, escolher)
    else Alert.alert('Entregar em', undefined, [...nomes.slice(0, 2).map((n, i) => ({ text: n, onPress: () => escolher(i) })), { text: 'Gerenciar endereços', onPress: () => navigation.navigate('Enderecos') }])
  }

  function trocarPlano() {
    Alert.alert(`Trocar para o ${outro.nome}?`, 'A mudança vale a partir da próxima cobrança.', [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Trocar', onPress: async () => {
        try { const { data } = await api.post(`/assinaturas/${a.id}/trocar-plano`, { id_produto: outro.id }); Alert.alert('Pronto', data.message || 'Plano alterado.'); recarregar() }
        catch (e) { Alert.alert('Ops', String(e?.response?.data?.detail || 'Não foi possível trocar agora.')) }
      } },
    ])
  }

  const alvo = opc ? mesAno(opc.edicao_alvo + 'T12:00:00') : ''
  async function executar(fn, ok) {
    try { const { data } = await fn(); Alert.alert('Pronto', ok(data)); atualizar() }
    catch (e) { Alert.alert('Ops', String(e?.response?.data?.detail || 'Não foi possível agora.')) }
  }
  function pular() {
    const anual = !opc.mensal
    Alert.alert(anual ? `Adiar a edição de ${alvo}?` : `Pular a edição de ${alvo}?`,
      anual ? 'Seu plano anual ganha mais 1 mês no fim.' : 'Não haverá caixa nem cobrança nesse mês. Depois tudo volta ao normal.', [
      { text: 'Voltar', style: 'cancel' },
      { text: anual ? 'Adiar' : 'Pular', onPress: () => executar(() => api.post(`/assinaturas/${a.id}/pular`),
        d => d.tipo === 'adiamento' ? `Edição adiada. Seu plano vai até ${dataLonga(d.novo_fim)}.` : `Edição pulada. A cobrança volta em ${dataLonga(d.retoma_em)}.`) },
    ])
  }
  function pausar() {
    const op = (m) => ({ text: `${m} ${m > 1 ? 'meses' : 'mês'}`, onPress: () => executar(() => api.post(`/assinaturas/${a.id}/pausar`, { meses: m }),
      d => `Assinatura pausada. A cobrança volta em ${dataLonga(d.retoma_em)}.`) })
    Alert.alert('Pausar por quanto tempo?', `A partir da edição de ${alvo}. Sem caixa e sem cobrança no período.`, [op(1), op(2), op(3), { text: 'Voltar', style: 'cancel' }])
  }
  function desfazer(p) {
    Alert.alert('Desfazer?', 'Sua caixa volta a vir normalmente.', [{ text: 'Voltar', style: 'cancel' },
      { text: 'Desfazer', onPress: () => executar(() => api.delete(`/pausas/${p.id}`), () => 'Sua assinatura segue normalmente.') }])
  }

  function cancelar() {
    const ate = a.proximo_ciclo ? ` Você continua membro até ${dataLonga(a.proximo_ciclo)}.` : ''
    Alert.alert('Cancelar assinatura?', `As próximas cobranças param.${ate}`, [
      ...(opc?.mensal && opc.pausas_restantes ? [{ text: 'Pausar por um tempo', onPress: pausar }] : opc?.mensal && opc.pulos_restantes ? [{ text: 'Pular só a próxima', onPress: pular }] : []),
      ...(outro && a.pode_trocar_plano && /reserva/i.test(a.produto || '') ? [{ text: `Trocar para o ${outro.nome}`, onPress: trocarPlano }] : []),
      { text: 'Manter assinatura', style: 'cancel' },
      { text: 'Cancelar assinatura', style: 'destructive', onPress: async () => {
        try { await api.post(`/assinaturas/${a.id}/cancelar`); recarregar() }
        catch (e) { Alert.alert('Ops', String(e?.response?.data?.detail || 'Não foi possível cancelar agora.')) }
      } },
    ])
  }

  return (
    <Tela refreshControl={<RefreshControl refreshing={false} onRefresh={recarregar} tintColor={colors.dourado} />}>
      <Cabecalho eyebrow="Minha assinatura" titulo={`${a.produto || 'Vaultierre'} · ${PLANO[a.plano] || a.plano}`} />
      <Card destaque style={{ marginTop: 0 }}>
        <View style={st.linha}><Eyebrow>{a.status === 'cancelada' ? 'Membro até' : 'Próxima cobrança'}</Eyebrow>
          <SeloAtivo texto={ROTULO_STATUS[a.status]} cor={corStatus(a.status)} /></View>
        <Titulo tamanho={30} style={{ marginTop: 6 }}>{dataLonga(a.status === 'cancelada' ? a.data_fim : a.proximo_ciclo)}</Titulo>
        {a.valor != null && a.status !== 'cancelada' ? <Muted style={{ marginTop: 4 }}>{moeda(a.valor)} no cartão cadastrado no Mercado Pago</Muted> : null}
        {a.status === 'atrasada' ? <Text style={st.alerta}>O pagamento não foi aprovado. Atualize o cartão no Mercado Pago para não perder a próxima edição.</Text> : null}
        {a.status === 'pendente' ? <Text style={st.alerta}>Estamos aguardando a confirmação do pagamento.</Text> : null}
      </Card>

      <Card>
        <View style={st.linha}><Eyebrow>Entrega</Eyebrow>
          <TouchableOpacity onPress={() => { toque(); trocarEndereco() }}><Text style={st.acao}>Trocar</Text></TouchableOpacity></View>
        <Text style={st.texto}>{a.endereco || 'Endereço principal da conta'}</Text>
        <Muted style={{ marginTop: 4 }}>Frete grátis</Muted>
      </Card>

      {opc ? (
        <Card>
          <Eyebrow>Precisa de um tempo?</Eyebrow>
          <Muted style={{ marginTop: 6, lineHeight: 18 }}>Vale para a edição de {alvo} se pedir até {dataLonga(opc.limite)}.</Muted>
          {opc.agendadas.map(p => (
            <View key={p.id} style={st.agendada}>
              <Text style={st.agendadaT}>{TIPO_PAUSA[p.tipo]}: {p.de === p.ate ? mesAno(p.de + 'T12:00:00') : `${mesAno(p.de + 'T12:00:00')} a ${mesAno(p.ate + 'T12:00:00')}`}</Text>
              {p.tipo !== 'adiamento' ? <TouchableOpacity onPress={() => { toque(); desfazer(p) }}><Text style={st.acao}>Desfazer</Text></TouchableOpacity> : null}
            </View>
          ))}
          <Lista style={{ marginTop: 10 }}>
            {opc.mensal ? <>
              <ItemLista icone="caixa" titulo="Pular a próxima edição" detalhe={`${opc.pulos_restantes} de 2`} onPress={opc.pulos_restantes ? pular : undefined} />
              <ItemLista icone="cadeado" titulo="Pausar de 1 a 3 meses" detalhe={`${opc.pausas_restantes} de 2`} onPress={opc.pausas_restantes ? pausar : undefined} ultimo />
            </> : <ItemLista icone="caixa" titulo="Adiar a próxima edição" detalhe={`${opc.adiamentos_restantes} de 2`} onPress={opc.adiamentos_restantes ? pular : undefined} ultimo />}
          </Lista>
        </Card>
      ) : null}

      <Pedidos pedidos={pedidos} navigation={navigation} />

      {(a.pode_trocar_plano && outro) || a.pode_cancelar ? (
        <Lista style={{ marginTop: 12 }}>
          {a.pode_trocar_plano && outro ? <ItemLista icone="clube" titulo={`Trocar para ${outro.nome}`} onPress={trocarPlano} ultimo={!a.pode_cancelar} /> : null}
          {a.pode_cancelar ? <ItemLista icone="ajuda" titulo="Cancelar assinatura" perigo onPress={cancelar} ultimo /> : null}
        </Lista>
      ) : null}
    </Tela>
  )
}

function Pedidos({ pedidos, navigation }) {
  if (!pedidos.length) return null
  return (
    <Card onPress={() => navigation.navigate('MeusPedidos')}>
      <Eyebrow>Pedidos</Eyebrow>
      {pedidos.slice(0, 3).map((p, i) => (
        <View key={p.id} style={[st.pedido, i === Math.min(pedidos.length, 3) - 1 && { borderBottomWidth: 0 }]}>
          <Text style={st.pedidoT}>{mesAno(p.data)}</Text>
          <Muted>{moeda(p.valor_total)} · {STATUS_PEDIDO[p.status] || p.status}</Muted>
        </View>
      ))}
      {pedidos.length > 3 ? <Text style={[st.acao, { marginTop: 8 }]}>Ver todos</Text> : null}
    </Card>
  )
}

const st = StyleSheet.create({
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  acao: { color: colors.douradoClaro, fontFamily: fonts.uiMedio, fontSize: 13 },
  texto: { color: colors.texto, fontFamily: fonts.ui, fontSize: 13.5, marginTop: 6 },
  alerta: { color: colors.erro, fontFamily: fonts.ui, fontSize: 12.5, marginTop: 10, lineHeight: 18 },
  pedido: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.linhaSutil },
  pedidoT: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 14 },
  agendada: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginTop: 10 },
  agendadaT: { color: colors.texto, fontFamily: fonts.uiMedio, fontSize: 13, flex: 1 },
  link: { color: colors.douradoClaro, textAlign: 'center', fontFamily: fonts.uiMedio, marginTop: 18 },
})
