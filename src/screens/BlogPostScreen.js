// Post do blog.
import React, { useEffect, useState } from 'react'
import { Image } from 'expo-image'
import ConteudoStrapi from '../components/ConteudoStrapi'
import { getPost } from '../services/strapi'
import { capaDo } from './BlogScreen'
import { Tela, Titulo, Carregando } from '../components/ui'

export default function BlogPostScreen({ route }) {
  const { slug, titulo, i = 0 } = route.params || {}
  const [post, setPost] = useState(undefined)
  useEffect(() => { getPost(slug).then(d => setPost(d?.[0] || null)).catch(() => setPost(null)) }, [slug])
  if (post === undefined) return <Carregando />
  return (
    <Tela abas={false} contentStyle={{ paddingHorizontal: 0 }}>
      <Image source={capaDo(post, i)} style={{ height: 230, width: '100%' }} contentFit="cover" />
      <Titulo tamanho={30} style={{ marginTop: 18, marginBottom: 10, paddingHorizontal: 18 }}>{post?.titulo || titulo}</Titulo>
      <ConteudoStrapi blocos={post?.conteudo} />
    </Tela>
  )
}
