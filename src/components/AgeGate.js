// Confirmação de 18+ na primeira abertura (exigência para app de bebida alcoólica).
import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Botao } from './ui'
import { colors, fonts, gradients, IMAGENS } from '../theme'

export default function AgeGate({ onConfirmar }) {
  const [recusado, setRecusado] = useState(false)
  return (
    <View style={st.tela}>
      <Image source={IMAGENS.boasVindas} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient colors={gradients.hero} locations={[0, 0.4, 0.7]} style={StyleSheet.absoluteFill} />
      <View style={st.conteudo}>
        <Image source={IMAGENS.selo} style={{ width: 72, height: 72, marginBottom: 20 }} contentFit="contain" />
        <Text style={st.titulo}>{recusado ? 'Até breve.' : 'Você tem 18 anos ou mais?'}</Text>
        <Text style={st.sub}>{recusado
          ? 'O Vaultierre é destinado apenas a maiores de idade.'
          : 'Este aplicativo apresenta bebidas alcoólicas e é destinado apenas a maiores de 18 anos.'}</Text>
        {recusado ? <Botao tipo="contorno" titulo="Voltar" onPress={() => setRecusado(false)} /> : (
          <>
            <Botao titulo="Sim, tenho 18 anos ou mais" onPress={onConfirmar} style={{ marginBottom: 10 }} />
            <Botao tipo="contorno" titulo="Não" onPress={() => setRecusado(true)} />
          </>
        )}
        <Text style={st.legal}>Beba com moderação.</Text>
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  conteudo: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 48 },
  titulo: { color: colors.texto, fontFamily: fonts.serif, fontSize: 36, lineHeight: 38 },
  sub: { color: '#CFC8BC', fontFamily: fonts.ui, fontSize: 14, lineHeight: 21, marginTop: 12, marginBottom: 26 },
  legal: { color: '#7E776C', fontFamily: fonts.ui, fontSize: 11, textAlign: 'center', marginTop: 16 },
})
