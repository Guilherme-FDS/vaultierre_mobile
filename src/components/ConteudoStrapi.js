// Renderiza o texto rico do CMS (parágrafos, títulos, citações e listas) no tema Noir.
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, fonts } from '../theme'
import { extrairTextoStrapi } from '../utils/extrairTextoStrapi'

export default function ConteudoStrapi({ blocos }) {
  if (!blocos || blocos.length === 0) return <Text style={st.p}>Conteúdo em breve.</Text>
  return (
    <View style={{ paddingHorizontal: 18 }}>
      {blocos.map((b, i) => {
        const t = extrairTextoStrapi(b.children)
        if (b.type === 'heading' && b.level <= 2) return <Text key={i} style={st.h2}>{t}</Text>
        if (b.type === 'heading') return <Text key={i} style={st.h3}>{t}</Text>
        if (b.type === 'quote') return <Text key={i} style={st.citacao}>{t}</Text>
        if (b.type === 'list') return (
          <View key={i} style={{ marginBottom: 14 }}>
            {(b.children || []).map((it, j) => <Text key={j} style={st.item}>{b.format === 'ordered' ? `${j + 1}. ` : '—  '}{extrairTextoStrapi(it.children)}</Text>)}
          </View>
        )
        return <Text key={i} style={st.p}>{t}</Text>
      })}
    </View>
  )
}

const st = StyleSheet.create({
  p: { color: '#D9D2C6', fontFamily: fonts.ui, fontSize: 15.5, lineHeight: 25, marginBottom: 14 },
  h2: { color: colors.texto, fontFamily: fonts.serif, fontSize: 26, lineHeight: 29, marginTop: 10, marginBottom: 10 },
  h3: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 17, marginTop: 6, marginBottom: 8 },
  citacao: { color: colors.douradoClaro, fontFamily: fonts.serifItalico, fontSize: 21, lineHeight: 28, borderLeftWidth: 2, borderLeftColor: colors.dourado, paddingLeft: 14, marginVertical: 12 },
  item: { color: '#D9D2C6', fontFamily: fonts.ui, fontSize: 15, lineHeight: 24 },
})
