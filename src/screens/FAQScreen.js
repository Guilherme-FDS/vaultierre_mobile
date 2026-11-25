// Perguntas frequentes (conteúdo do CMS, o mesmo do site).
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { getFaqs } from '../services/strapi'
import { extrairTextoStrapi } from '../utils/extrairTextoStrapi'
import { Tela, Cabecalho, Muted, Carregando, toque } from '../components/ui'
import { colors, fonts } from '../theme'

const resposta = (r) => Array.isArray(r) ? r.map(b => extrairTextoStrapi(b.children)).filter(Boolean).join('\n\n') : (r || '')

export default function FAQScreen({ navigation }) {
  const [faqs, setFaqs] = useState(null)
  const [aberto, setAberto] = useState(null)
  useEffect(() => { getFaqs().then(d => setFaqs(d || [])).catch(() => setFaqs([])) }, [])
  if (!faqs) return <Carregando />
  return (
    <Tela abas={false}>
      <Cabecalho eyebrow="Ajuda" titulo="Perguntas frequentes" />
      {!faqs.length ? <Muted>Nenhuma pergunta cadastrada ainda.</Muted> : faqs.map((f, i) => {
        const ab = aberto === i
        return (
          <TouchableOpacity key={f.id ?? i} activeOpacity={0.8} onPress={() => { toque(); setAberto(ab ? null : i) }} style={st.item}>
            <View style={st.linha}><Text style={st.pergunta}>{f.pergunta}</Text><Text style={st.mais}>{ab ? '−' : '+'}</Text></View>
            {ab ? <Text style={st.resposta}>{resposta(f.resposta)}</Text> : null}
          </TouchableOpacity>
        )
      })}
      <TouchableOpacity onPress={() => navigation.navigate('Contato')} style={{ marginTop: 22 }}>
        <Text style={st.link}>Não achou? Fale com a gente</Text>
      </TouchableOpacity>
    </Tela>
  )
}

const st = StyleSheet.create({
  item: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.linhaSutil },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  pergunta: { color: colors.texto, fontFamily: fonts.uiMedio, fontSize: 15, flex: 1, lineHeight: 21 },
  mais: { color: colors.douradoClaro, fontSize: 20, lineHeight: 21 },
  resposta: { color: colors.textoSecundario, fontFamily: fonts.ui, fontSize: 14, lineHeight: 21, marginTop: 10 },
  link: { color: colors.douradoClaro, fontFamily: fonts.uiMedio, textAlign: 'center' },
})
