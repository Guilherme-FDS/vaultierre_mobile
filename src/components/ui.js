// Peças visuais do tema Noir, usadas por todas as telas novas.
import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { colors, fonts, gradients, radius, spacing } from '../theme'
import Icone from './Icone'

export const toque = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})

// Tela com área segura e espaço para a barra de abas flutuante
export function Tela({ children, rolar = true, abas = true, style, contentStyle, refreshControl }) {
  const pad = { paddingHorizontal: spacing.md, paddingBottom: abas ? 120 : 40 }
  return (
    <SafeAreaView edges={['top']} style={[{ flex: 1, backgroundColor: colors.fundo }, style]}>
      {rolar
        ? <ScrollView contentContainerStyle={[pad, contentStyle]} showsVerticalScrollIndicator={false} refreshControl={refreshControl}>{children}</ScrollView>
        : <View style={[{ flex: 1 }, pad, contentStyle]}>{children}</View>}
    </SafeAreaView>
  )
}

export const T = ({ style, ...p }) => <Text style={[s.texto, style]} {...p} />
export const Eyebrow = ({ children, style }) => <Text style={[s.eyebrow, style]}>{children}</Text>
export const Titulo = ({ children, style, tamanho = 28 }) => <Text style={[s.titulo, { fontSize: tamanho, lineHeight: tamanho * 1.08 }, style]}>{children}</Text>
export const Muted = ({ children, style }) => <Text style={[s.muted, style]}>{children}</Text>

export function Cabecalho({ eyebrow, titulo, direita, style }) {
  return (
    <View style={[s.cab, style]}>
      <View style={{ flex: 1 }}>{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}<Titulo>{titulo}</Titulo></View>
      {direita}
    </View>
  )
}

export function Card({ children, style, onPress, destaque }) {
  const conteudo = destaque
    ? <LinearGradient colors={gradients.destaque} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.card, s.cardDestaque, style]}>{children}</LinearGradient>
    : <View style={[s.card, style]}>{children}</View>
  if (!onPress) return conteudo
  return <TouchableOpacity activeOpacity={0.85} onPress={() => { toque(); onPress() }}>{conteudo}</TouchableOpacity>
}

export function Botao({ titulo, onPress, tipo = 'ouro', icone, carregando, desabilitado, style }) {
  const off = carregando || desabilitado
  const corTexto = tipo === 'ouro' ? '#15120D' : tipo === 'branco' ? '#000' : colors.texto
  const miolo = carregando
    ? <ActivityIndicator color={corTexto} />
    : <View style={s.btnLinha}>{icone}<Text style={[s.btnTexto, { color: corTexto }]}>{titulo}</Text></View>
  const acao = () => { if (!off) { toque(); onPress?.() } }
  if (tipo === 'ouro') {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={acao} disabled={off} style={[{ opacity: desabilitado ? 0.5 : 1 }, style]}>
        <LinearGradient colors={gradients.dourado} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btn}>{miolo}</LinearGradient>
      </TouchableOpacity>
    )
  }
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={acao} disabled={off}
      style={[s.btn, tipo === 'branco' ? s.btnBranco : s.btnContorno, { opacity: desabilitado ? 0.5 : 1 }, style]}>{miolo}</TouchableOpacity>
  )
}

export function SeloAtivo({ texto = 'Ativa', cor = colors.sucesso }) {
  return <View style={[s.selo, { borderColor: cor + '59', backgroundColor: cor + '1F' }]}><Text style={[s.seloTexto, { color: cor }]}>● {texto}</Text></View>
}

export const Secao = ({ children }) => <Text style={s.secao}>{children}</Text>

export function Lista({ children, style }) { return <View style={[s.lista, style]}>{children}</View> }
export function ItemLista({ icone, titulo, onPress, perigo, ultimo, detalhe }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => { toque(); onPress?.() }} style={[s.item, ultimo && { borderBottomWidth: 0 }]}>
      {icone ? <Icone nome={icone} cor={perigo ? colors.erro : colors.douradoClaro} /> : null}
      <Text style={[s.itemTexto, perigo && { color: colors.erro }]}>{titulo}</Text>
      {detalhe ? <Muted style={{ marginLeft: 'auto', marginRight: 6 }}>{detalhe}</Muted> : null}
      <View style={detalhe ? null : { marginLeft: 'auto' }}><Icone nome="seta" tamanho={16} cor="#5A544C" /></View>
    </TouchableOpacity>
  )
}

export function Entrada({ rotulo, style, ...p }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {rotulo ? <Text style={s.rotulo}>{rotulo}</Text> : null}
      <TextInput placeholderTextColor={colors.textoTerciario} style={[s.input, style]} {...p} />
    </View>
  )
}

export function Carregando() {
  return <View style={{ flex: 1, backgroundColor: colors.fundo, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.dourado} size="large" /></View>
}

export function Vazio({ icone = 'caixa', titulo, texto, acao, onAcao }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
      <View style={s.vazioIcone}><Icone nome={icone} tamanho={24} /></View>
      <Titulo tamanho={22} style={{ textAlign: 'center', marginTop: 12 }}>{titulo}</Titulo>
      {texto ? <Muted style={{ textAlign: 'center', marginTop: 6, lineHeight: 19 }}>{texto}</Muted> : null}
      {acao ? <Botao titulo={acao} onPress={onAcao} style={{ marginTop: 16, alignSelf: 'stretch' }} /> : null}
    </Card>
  )
}

export const s = StyleSheet.create({
  texto: { color: colors.texto, fontFamily: fonts.ui, fontSize: 14 },
  eyebrow: { color: colors.dourado, fontFamily: fonts.uiForte, fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', marginBottom: 2 },
  titulo: { color: colors.texto, fontFamily: fonts.serif },
  muted: { color: colors.textoSecundario, fontFamily: fonts.ui, fontSize: 12.5 },
  cab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 18 },
  card: { backgroundColor: colors.fundoSecundario, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: radius.md, padding: 14, marginTop: 12 },
  cardDestaque: { borderColor: 'rgba(226,192,106,0.45)' },
  btn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  btnLinha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnTexto: { fontFamily: fonts.uiForte, fontSize: 15 },
  btnBranco: { backgroundColor: '#fff' },
  btnContorno: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  selo: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  seloTexto: { fontFamily: fonts.uiMedio, fontSize: 10.5 },
  secao: { color: colors.textoSecundario, fontFamily: fonts.uiForte, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginTop: 18, marginBottom: 6, marginLeft: 4 },
  lista: { backgroundColor: colors.fundoSecundario, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: radius.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.linhaSutil },
  itemTexto: { color: colors.texto, fontFamily: fonts.ui, fontSize: 14.5 },
  rotulo: { color: colors.textoSecundario, fontFamily: fonts.uiForte, fontSize: 12, marginBottom: 6, letterSpacing: 0.3 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.bordaCard, backgroundColor: colors.fundoSecundario, color: colors.texto, paddingHorizontal: 14, fontFamily: fonts.ui, fontSize: 15 },
  vazioIcone: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center' },
})
