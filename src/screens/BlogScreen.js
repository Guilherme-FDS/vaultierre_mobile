// Blog: histórias de destilarias e guias (conteúdo do CMS).
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { getPosts, STRAPI_URL } from '../services/strapi'
import { Tela, Cabecalho, Muted, Eyebrow, Carregando, toque } from '../components/ui'
import { colors, fonts, IMAGENS } from '../theme'

const data = (s) => s ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''
export const capaDo = (p, i = 0) => {
  const url = p?.capa?.url || p?.capa?.data?.attributes?.url
  return url ? { uri: url.startsWith('http') ? url : `${STRAPI_URL}${url}` } : IMAGENS.edicoes[i % IMAGENS.edicoes.length]
}

export default function BlogScreen({ navigation }) {
  const [posts, setPosts] = useState(null)
  useEffect(() => { getPosts().then(d => setPosts(d || [])).catch(() => setPosts([])) }, [])
  if (!posts) return <Carregando />
  return (
    <Tela abas={false}>
      <Cabecalho eyebrow="Blog" titulo="O que está por trás do copo" />
      {!posts.length ? <Muted>Nenhum post publicado ainda.</Muted> : posts.map((p, i) => (
        <TouchableOpacity key={p.id} activeOpacity={0.85} style={st.card} onPress={() => { toque(); navigation.navigate('BlogPost', { slug: p.slug, titulo: p.titulo, i }) }}>
          <Image source={capaDo(p, i)} style={st.capa} contentFit="cover" transition={200} />
          <View style={{ padding: 14 }}>
            <Eyebrow>{data(p.publicado_em || p.createdAt)}</Eyebrow>
            <Text style={st.titulo}>{p.titulo}</Text>
            {p.resumo ? <Muted numberOfLines={2} style={{ marginTop: 6, lineHeight: 19 }}>{p.resumo}</Muted> : null}
          </View>
        </TouchableOpacity>
      ))}
    </Tela>
  )
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.fundoSecundario, borderRadius: 18, borderWidth: 1, borderColor: colors.bordaCard, overflow: 'hidden', marginBottom: 14 },
  capa: { height: 160, width: '100%' },
  titulo: { color: colors.texto, fontFamily: fonts.serif, fontSize: 22, lineHeight: 25, marginTop: 4 },
})
