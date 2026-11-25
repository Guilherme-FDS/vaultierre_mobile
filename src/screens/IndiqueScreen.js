// Indique e ganhe: código do cliente, link, WhatsApp/compartilhar e indicações feitas.
import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, Share, Linking, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import api from '../services/api'
import { Tela, Cabecalho, Card, Eyebrow, Titulo, Muted, Botao, Carregando, SeloAtivo, toque } from '../components/ui'
import { colors, fonts } from '../theme'

export default function IndiqueScreen() {
  const [d, setD] = useState(null)
  const [copiado, setCopiado] = useState(false)
  useFocusEffect(useCallback(() => { api.get('/indicacoes/minha').then(r => setD(r.data)).catch(() => setD({ erro: true })) }, []))
  if (!d) return <Carregando />
  if (d.erro) return <Tela abas={false}><Muted>Não foi possível carregar agora.</Muted></Tela>
  const msg = `Entrei para o Vaultierre, um clube de destilados raros. Com meu link você ganha ${d.desconto_amigo}% na primeira caixa: ${d.link}`
  return (
    <Tela abas={false}>
      <Cabecalho eyebrow="Indique e ganhe" titulo="Presenteie um amigo" />
      <Muted style={{ lineHeight: 20, marginTop: -8 }}>Seu amigo ganha {d.desconto_amigo}% na primeira caixa. Você ganha {d.desconto_indicador}% na próxima mensalidade a cada amigo que virar membro.</Muted>
      <Card destaque>
        <Eyebrow>Seu código</Eyebrow>
        <TouchableOpacity onPress={async () => { toque(); await Clipboard.setStringAsync(d.link); setCopiado(true); setTimeout(() => setCopiado(false), 2000) }}>
          <Text style={st.codigo}>{d.codigo}</Text>
          <Muted>{copiado ? 'Link copiado!' : 'Toque para copiar o link'}</Muted>
        </TouchableOpacity>
        <Botao titulo="Enviar pelo WhatsApp" onPress={() => Linking.openURL('https://wa.me/?text=' + encodeURIComponent(msg))} style={{ marginTop: 16 }} />
        <Botao tipo="contorno" titulo="Compartilhar" onPress={() => Share.share({ message: msg })} style={{ marginTop: 10 }} />
      </Card>
      <Eyebrow style={{ marginTop: 22 }}>Suas indicações</Eyebrow>
      {d.indicacoes.length ? d.indicacoes.map((i, k) => (
        <View key={k} style={st.linha}>
          <Text style={st.nome}>{i.nome}</Text>
          <SeloAtivo texto={i.status === 'pendente' ? 'Desconto na fila' : i.recompensa === 'cupom' ? `Cupom ${i.cupom}` : 'Desconto aplicado'} cor={i.status === 'pendente' ? colors.douradoClaro : colors.sucesso} />
        </View>
      )) : <Muted style={{ marginTop: 8 }}>Nenhum amigo entrou ainda. O primeiro presente está a um link de distância.</Muted>}
    </Tela>
  )
}

const st = StyleSheet.create({
  codigo: { color: colors.douradoClaro, fontFamily: fonts.uiNegrito, fontSize: 30, letterSpacing: 4, marginTop: 6 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.linhaSutil },
  nome: { color: colors.texto, fontFamily: fonts.uiMedio, fontSize: 14 },
})
