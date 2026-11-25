// Endereços: lista, principal, editar e excluir.
import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../services/api'
import { msgErro } from '../utils/mascaras'
import { Tela, Cabecalho, Card, Botao, Muted, Carregando, Vazio, SeloAtivo, toque } from '../components/ui'
import { colors, fonts } from '../theme'

export default function EnderecosScreen({ navigation }) {
  const [lista, setLista] = useState(null)
  const carregar = useCallback(() => {
    api.get('/configuracoes/enderecos').then(r => setLista(r.data || [])).catch(() => { setLista([]); Alert.alert('Ops', 'Não foi possível carregar seus endereços.') })
  }, [])
  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  const principal = async (id) => {
    try { await api.patch(`/configuracoes/enderecos/${id}/principal`); carregar() } catch (e) { Alert.alert('Ops', msgErro(e, 'Não foi possível.')) }
  }
  const excluir = (e) => Alert.alert('Excluir endereço?', `${e.endereco}, ${e.numero}`, [
    { text: 'Voltar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: async () => {
      try { await api.delete(`/configuracoes/enderecos/${e.id}`); carregar() } catch (err) { Alert.alert('Ops', msgErro(err, 'Não foi possível excluir.')) }
    } },
  ])

  if (!lista) return <Carregando />
  return (
    <Tela abas={false}>
      <Cabecalho eyebrow="Conta" titulo="Endereços" />
      {!lista.length ? <Vazio icone="pin" titulo="Nenhum endereço" texto="Cadastre onde você quer receber suas caixas." /> : lista.map(e => (
        <Card key={e.id} style={{ marginTop: 0, marginBottom: 10 }}>
          <View style={st.linha}>
            <Text style={st.titulo}>{e.endereco}, {e.numero}</Text>
            {e.principal ? <SeloAtivo texto="Principal" cor={colors.douradoClaro} /> : null}
          </View>
          <Muted style={{ marginTop: 4 }}>{[e.complemento, e.bairro].filter(Boolean).join(' · ')}</Muted>
          <Muted>{e.cidade}/{e.estado} · CEP {String(e.cep).replace(/(\d{5})(\d{3})/, '$1-$2')}</Muted>
          <View style={st.acoes}>
            {!e.principal ? <TouchableOpacity onPress={() => { toque(); principal(e.id) }}><Text style={st.acao}>Tornar principal</Text></TouchableOpacity> : null}
            <TouchableOpacity onPress={() => navigation.navigate('EnderecoForm', { endereco: e })}><Text style={st.acao}>Editar</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => excluir(e)}><Text style={[st.acao, { color: colors.erro }]}>Excluir</Text></TouchableOpacity>
          </View>
        </Card>
      ))}
      <Botao titulo="Adicionar endereço" onPress={() => navigation.navigate('EnderecoForm')} style={{ marginTop: 8 }} />
    </Tela>
  )
}

const st = StyleSheet.create({
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  titulo: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 14.5, flex: 1 },
  acoes: { flexDirection: 'row', gap: 18, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.linhaSutil },
  acao: { color: colors.douradoClaro, fontFamily: fonts.uiMedio, fontSize: 13 },
})
