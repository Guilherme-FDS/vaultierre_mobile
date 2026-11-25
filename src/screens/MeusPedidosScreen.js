// Pedidos e pagamentos: cada pedido com status, valor e itens.
import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../services/api'
import { moeda } from '../services/dados'
import { Tela, Cabecalho, Card, Muted, Carregando, Vazio, SeloAtivo, toque } from '../components/ui'
import { colors, fonts } from '../theme'

const STATUS = { pago: ['Pago', '#6FBF8E'], pendente: ['Aguardando', '#E2C06A'], cancelado: ['Cancelado', '#D8897E'], estornado: ['Estornado', '#9C958A'] }
const data = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

export default function MeusPedidosScreen({ navigation }) {
  const [pedidos, setPedidos] = useState(null)
  const [aberto, setAberto] = useState(null)
  useFocusEffect(useCallback(() => {
    api.get('/configuracoes/perfil').then(r => setPedidos(r.data.pedidos || [])).catch(() => { setPedidos([]); Alert.alert('Ops', 'Não foi possível carregar seus pedidos.') })
  }, []))
  if (!pedidos) return <Carregando />
  return (
    <Tela abas={false}>
      <Cabecalho eyebrow="Assinatura" titulo="Pedidos" />
      {!pedidos.length ? <Vazio icone="documento" titulo="Nenhum pedido ainda" acao="Ver os planos" onAcao={() => navigation.navigate('Tabs', { screen: 'Clube' })} /> : pedidos.map(p => {
        const [rotulo, cor] = STATUS[p.status] || [p.status, colors.textoSecundario]
        const ab = aberto === p.id
        return (
          <TouchableOpacity key={p.id} activeOpacity={0.85} onPress={() => { toque(); setAberto(ab ? null : p.id) }}>
            <Card style={{ marginTop: 0, marginBottom: 10 }}>
              <View style={st.linha}><Text style={st.titulo}>Pedido #{p.id}</Text><SeloAtivo texto={rotulo} cor={cor} /></View>
              <View style={[st.linha, { marginTop: 6 }]}><Muted>{data(p.data)}</Muted><Text style={st.valor}>{moeda(p.valor_total)}</Text></View>
              {ab ? (
                <View style={st.detalhe}>
                  {(p.itens || []).map((i, k) => (
                    <View key={k} style={st.linha}><Muted>{i.nome_produto} · {i.plano}</Muted><Muted>{moeda(i.valor_total)}</Muted></View>
                  ))}
                  {p.cupom_aplicado ? <Muted style={{ color: colors.sucesso, marginTop: 4 }}>Cupom {p.cupom_aplicado} · economia de {moeda(p.economia)}</Muted> : null}
                </View>
              ) : null}
            </Card>
          </TouchableOpacity>
        )
      })}
    </Tela>
  )
}

const st = StyleSheet.create({
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  titulo: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 15 },
  valor: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 15 },
  detalhe: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.linhaSutil, gap: 6 },
})
