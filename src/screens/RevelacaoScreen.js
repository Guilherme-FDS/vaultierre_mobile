// Revelação / ficha da edição. Abre depois de "Já recebi minha caixa" (revelar=true) ou a partir da Adega.
// Regra de ouro: o backend só devolve rótulos de caixas já recebidas.
import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert, TextInput } from 'react-native'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'
import api from '../services/api'
import { Tela, Eyebrow, Titulo, Muted, Card, Botao } from '../components/ui'
import Estrelas from '../components/Estrelas'
import Icone from '../components/Icone'
import { colors, fonts } from '../theme'

const mesAno = (iso) => { const t = new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' '); return t.charAt(0).toUpperCase() + t.slice(1) }
const TOPICOS = [['aroma', 'Aroma'], ['sabor', 'Sabor'], ['finalizacao', 'Finalização'], ['harmonizacao', 'Harmonização']]

function Ficha({ r, onNota }) {
  const [nota, setNota] = useState(r.nota || 0)
  const [comentario, setComentario] = useState('')
  const [salvo, setSalvo] = useState(!!r.nota)
  async function avaliar(n, texto = comentario) {
    const anterior = nota
    setNota(n)
    try { await api.post(`/rotulos/${r.id}/avaliar`, { nota: n, comentario: texto || null }); setSalvo(true); onNota?.(r.id, n) }
    catch (e) { setNota(anterior); Alert.alert('Ops', String(e?.response?.data?.detail || 'Não foi possível salvar sua nota.')) }
  }
  return (
    <Card style={st.ficha}>
      {r.foto_url ? <Image source={{ uri: r.foto_url }} style={st.foto} contentFit="cover" transition={300} /> : (
        <View style={[st.foto, st.semFoto]}><Icone nome="adega" tamanho={34} /></View>
      )}
      <Eyebrow style={{ marginTop: 14 }}>{[r.categoria, r.pais, r.teor].filter(Boolean).join(' · ')}</Eyebrow>
      <Titulo tamanho={28}>{r.nome}</Titulo>
      {r.historia ? <Text style={st.historia}>{r.historia}</Text> : null}
      {TOPICOS.filter(([k]) => r[k]).map(([k, t]) => (
        <View key={k} style={st.topico}><Text style={st.topicoT}>{t}</Text><Text style={st.topicoV}>{r[k]}</Text></View>
      ))}
      <View style={st.avaliar}>
        <Text style={st.topicoT}>{salvo ? 'Sua nota' : 'O que achou?'}</Text>
        <Estrelas nota={nota} onNota={(n) => avaliar(n)} tamanho={26} />
        {nota ? (
          <TextInput value={comentario} onChangeText={setComentario} onEndEditing={() => nota && comentario && avaliar(nota)}
            placeholder="Uma nota sua (opcional): com o que tomou, o que lembrou…" placeholderTextColor={colors.textoTerciario}
            style={st.comentario} multiline maxLength={500} />
        ) : <Muted style={{ fontSize: 12 }}>Sua nota ajuda a curadoria a acertar a próxima caixa.</Muted>}
      </View>
    </Card>
  )
}

export default function RevelacaoScreen({ route, navigation }) {
  const { entrada, revelar } = route.params || {}
  React.useEffect(() => { if (revelar) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}) }, [revelar])
  if (!entrada) return null
  return (
    <Tela>
      <View style={{ alignItems: 'center', marginBottom: 6 }}>
        <Eyebrow>{revelar ? 'A surpresa' : 'Edição'} nº {String(entrada.numero).padStart(2, '0')} · {mesAno(entrada.mes)}</Eyebrow>
        <Titulo tamanho={32} style={{ textAlign: 'center' }}>{entrada.edicao}</Titulo>
        {revelar ? <Muted style={{ textAlign: 'center', marginTop: 6, lineHeight: 19 }}>
          {entrada.rotulos.length > 1 ? 'Estes são os rótulos' : 'Este é o rótulo'} da sua caixa. Sirva, prove com calma e conte o que achou.
        </Muted> : null}
      </View>
      {entrada.rotulos.map(r => <Ficha key={r.id} r={r} />)}
      {revelar ? <Botao titulo="Ver minha adega" tipo="contorno" onPress={() => navigation.navigate('Tabs', { screen: 'Adega' })} style={{ marginTop: 14 }} /> : null}
    </Tela>
  )
}

const st = StyleSheet.create({
  ficha: { overflow: 'hidden', paddingBottom: 16 },
  foto: { height: 260, marginHorizontal: -14, marginTop: -14, backgroundColor: colors.superficie2 },
  semFoto: { alignItems: 'center', justifyContent: 'center' },
  historia: { color: colors.texto, fontFamily: fonts.serifItalico, fontSize: 17, lineHeight: 24, marginTop: 8 },
  topico: { borderTopWidth: 1, borderTopColor: colors.linhaSutil, paddingTop: 10, marginTop: 10 },
  topicoT: { color: colors.douradoClaro, fontFamily: fonts.uiForte, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 },
  topicoV: { color: colors.texto, fontFamily: fonts.ui, fontSize: 14, lineHeight: 20 },
  avaliar: { borderTopWidth: 1, borderTopColor: colors.bordaCard, paddingTop: 14, marginTop: 14, gap: 10 },
  comentario: { color: colors.texto, fontFamily: fonts.ui, fontSize: 13.5, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: 12, padding: 12, minHeight: 64, textAlignVertical: 'top' },
})
