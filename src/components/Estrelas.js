// Nota de 1 a 5 (somente leitura ou tocável).
import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import Icone from './Icone'
import { toque } from './ui'
import { colors } from '../theme'

export default function Estrelas({ nota = 0, onNota, tamanho = 16 }) {
  return (
    <View style={{ flexDirection: 'row', gap: tamanho > 20 ? 8 : 3 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const ic = <Icone nome="estrela" tamanho={tamanho} preenchido={n <= nota} cor={n <= nota ? colors.dourado : colors.textoTerciario} />
        return onNota
          ? <TouchableOpacity key={n} hitSlop={6} accessibilityLabel={`Nota ${n}`} onPress={() => { toque(); onNota(n) }}>{ic}</TouchableOpacity>
          : <View key={n}>{ic}</View>
      })}
    </View>
  )
}
