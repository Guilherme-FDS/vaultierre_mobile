// Página institucional com conteúdo do CMS (Sobre, Envio e devoluções, Reembolso).
import React, { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import ConteudoStrapi from './ConteudoStrapi'
import { getPagina } from '../services/strapi'
import { Tela, Cabecalho } from './ui'
import { colors } from '../theme'

export default function PaginaCMS({ slug, eyebrow, titulo, children }) {
  const [conteudo, setConteudo] = useState(undefined)
  useEffect(() => { getPagina(slug).then(d => setConteudo(d?.[0]?.conteudo || null)).catch(() => setConteudo(null)) }, [slug])
  return (
    <Tela abas={false} contentStyle={{ paddingHorizontal: 0 }}>
      <Cabecalho eyebrow={eyebrow} titulo={titulo} style={{ paddingHorizontal: 18 }} />
      {conteudo === undefined ? <ActivityIndicator color={colors.dourado} /> : <ConteudoStrapi blocos={conteudo} />}
      {children}
    </Tela>
  )
}
