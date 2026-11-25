// Barra de abas flutuante com vidro (versão A aprovada), igual em todas as telas.
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icone from './Icone'
import { toque } from './ui'
import { colors, fonts } from '../theme'

const ICONES = { Inicio: 'home', Clube: 'clube', Adega: 'adega', Assinatura: 'assinatura', Conta: 'conta' }

export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets()
  return (
    <View pointerEvents="box-none" style={[st.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={st.barra}>
        {Platform.OS === 'ios' ? <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} /> : null}
        {state.routes.map((route, i) => {
          const ativo = state.index === i
          const titulo = descriptors[route.key].options.title ?? route.name
          return (
            <TouchableOpacity key={route.key} style={st.tab} activeOpacity={0.7}
              accessibilityRole="button" accessibilityState={ativo ? { selected: true } : {}} accessibilityLabel={titulo}
              onPress={() => {
                const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
                if (!ativo && !ev.defaultPrevented) { toque(); navigation.navigate(route.name) }
              }}>
              <Icone nome={ICONES[route.name]} tamanho={21} cor={ativo ? colors.douradoClaro : colors.textoSecundario} />
              <Text style={[st.rotulo, ativo && { color: colors.douradoClaro }]}>{titulo}</Text>
              <View style={[st.ponto, ativo && { backgroundColor: colors.douradoClaro }]} />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12 },
  barra: { height: 64, borderRadius: 22, overflow: 'hidden', flexDirection: 'row', alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(28,25,22,0.72)' : '#1C1916',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 4 },
  rotulo: { fontFamily: fonts.uiMedio, fontSize: 9.5, color: colors.textoSecundario, letterSpacing: 0.3 },
  ponto: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
})
