// Início (tela 2 aprovada): edição do mês + 4 blocos para o assinante; vitrine para o visitante.
import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../services/api'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../context/AuthContext'
import { useMinhaConta, usePosts, mesNome, dataCurta, corStatus, ROTULO_STATUS } from '../services/dados'
import { Tela, Cabecalho, Eyebrow, Titulo, Muted, Card, Botao, SeloAtivo, toque } from '../components/ui'
import Icone from '../components/Icone'
import { colors, fonts, IMAGENS } from '../theme'

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}
const mesNomeIso = (iso) => mesNome(new Date(iso + 'T12:00:00'))

// Status da caixa do mês (GET /caixa). Nunca mostra rótulo: só status e pista sem nome.
const ESTADOS = {
  em_curadoria: (c) => ({ eyebrow: `Edição de ${mesNomeIso(c.mes)}`, titulo: 'Em curadoria', texto: 'Sua caixa está sendo preparada a portas fechadas.' }),
  a_caminho: (c) => ({ eyebrow: `Edição de ${mesNomeIso(c.mes)}`, titulo: 'A caminho', texto: c.pista || 'Algo raro está chegando.', pista: !!c.pista }),
  aguardando_pagamento: (c) => ({ eyebrow: 'Sua assinatura', titulo: 'Aguardando pagamento', texto: c.proxima_cobranca ? `Primeira cobrança em ${dataCurta(c.proxima_cobranca)}. Depois disso sua caixa entra em curadoria.` : 'Assim que o pagamento for aprovado, sua caixa entra em curadoria.' }),
  pausada: () => ({ eyebrow: 'Sua assinatura', titulo: 'Assinatura pausada', texto: 'Sem caixa nem cobrança por enquanto. Quando a pausa acabar, a curadoria volta.' }),
}

function CartaoCaixa({ caixa, assinante, onPress, onRecebi, recebendo }) {
  const e = (assinante && ESTADOS[caixa?.status]?.(caixa)) || { eyebrow: 'Vaultierre', titulo: 'Uma caixa fechada por mês', texto: 'Você não sabe o que vem. Esse é o ponto.' }
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => { toque(); onPress?.() }} style={st.edicao}>
      <Image source={IMAGENS.edicaoDestaque} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      <LinearGradient colors={['rgba(14,13,12,0.25)', 'rgba(14,13,12,0.82)', '#0E0D0C']} locations={[0, 0.45, 0.8]} style={StyleSheet.absoluteFill} />
      <View style={st.edicaoInfo}>
        <Eyebrow>{e.eyebrow}</Eyebrow>
        <Titulo tamanho={26}>{e.titulo}</Titulo>
        <Text style={[st.edicaoTexto, e.pista && st.pista]}>{e.pista ? `Pista: ${e.texto}` : e.texto}</Text>
        {assinante && caixa?.status === 'a_caminho' ? (
          <Botao titulo="Já recebi minha caixa" carregando={recebendo} onPress={onRecebi} style={{ marginTop: 12 }} />
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

function Bloco({ icone, titulo, sub, selo, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => { toque(); onPress() }} style={st.bloco}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Icone nome={icone} />{selo}
      </View>
      <View>
        <Text style={st.blocoTitulo}>{titulo}</Text>
        <Muted numberOfLines={1} style={{ fontSize: 11.5, marginTop: 2 }}>{sub}</Muted>
      </View>
    </TouchableOpacity>
  )
}

export default function InicioScreen({ navigation }) {
  const { user } = useAuth()
  const { assinatura, carregando, recarregar } = useMinhaConta()
  const posts = usePosts(3)
  const nome = (user?.nome || '').split(' ')[0]

  const [caixa, setCaixa] = useState(null)
  const [recebendo, setRecebendo] = useState(false)
  const carregarCaixa = useCallback(() => { if (user) api.get('/caixa').then(r => setCaixa(r.data)).catch(() => {}); else setCaixa(null) }, [user])
  useFocusEffect(carregarCaixa)

  function recebi() {
    Alert.alert('A caixa já está com você?', 'Ao confirmar, revelamos os rótulos e as fichas de degustação. Só confirme com a caixa nas mãos.', [
      { text: 'Ainda não', style: 'cancel' },
      { text: 'Sim, revelar', onPress: async () => {
        setRecebendo(true)
        try { const { data } = await api.post(`/envios/${caixa.id_envio}/recebi`); carregarCaixa(); navigation.navigate('Revelacao', { entrada: data, revelar: true }) }
        catch (e) { Alert.alert('Ops', String(e?.response?.data?.detail || 'Não foi possível confirmar agora.')) }
        finally { setRecebendo(false) }
      } },
    ])
  }

  return (
    <Tela refreshControl={<RefreshControl refreshing={false} onRefresh={() => { recarregar(); carregarCaixa() }} tintColor={colors.dourado} />}>
      <Cabecalho eyebrow={user ? saudacao() : 'Vaultierre'} titulo={user ? nome || 'Membro' : 'Raro por natureza'}
        direita={<TouchableOpacity style={st.avatar} onPress={() => navigation.navigate(user ? 'Conta' : 'Login')}><Icone nome={user ? 'sino' : 'conta'} /></TouchableOpacity>} />

      <CartaoCaixa caixa={caixa} assinante={!!assinatura} recebendo={recebendo} onRecebi={recebi}
        onPress={() => navigation.navigate(assinatura ? 'Assinatura' : 'Clube')} />

      {assinatura ? (
        <View style={st.grade}>
          <Bloco icone="assinatura" titulo="Assinatura" sub={assinatura.proximo_ciclo ? `Cobrança em ${dataCurta(assinatura.proximo_ciclo)}` : ROTULO_STATUS[assinatura.status]}
            selo={<SeloAtivo texto={ROTULO_STATUS[assinatura.status]} cor={corStatus(assinatura.status)} />} onPress={() => navigation.navigate('Assinatura')} />
          <Bloco icone="adega" titulo="Adega" sub="Fichas de degustação" onPress={() => navigation.navigate('Adega')} />
          <Bloco icone="presente" titulo="Indique e ganhe" sub="Ganhe 20%" onPress={() => navigation.navigate('Indique')} />
          <Bloco icone="livro" titulo="Blog" sub={posts.length ? `${posts.length} histórias` : 'Histórias e guias'} onPress={() => navigation.navigate('Blog')} />
        </View>
      ) : (
        <>
          <Card destaque style={{ marginTop: 14 }}>
            <Eyebrow>Como funciona</Eyebrow>
            {[['bussola', 'Conte seu paladar', 'Um quiz rápido guia a curadoria.'],
              ['clube', 'Nós escolhemos', 'Essencial (1 rótulo) ou Reserva (2), escolhidos a portas fechadas.'],
              ['caixa', 'Abra a surpresa', 'A caixa chega fechada, sem aviso do que vem.'],
              ['adega', 'Descubra e coleciona', 'Confirme o recebimento e a ficha se revela aqui.']].map(([ic, t, d]) => (
              <View key={t} style={st.passo}><Icone nome={ic} /><View style={{ flex: 1 }}><Text style={st.blocoTitulo}>{t}</Text><Muted>{d}</Muted></View></View>
            ))}
            <Botao titulo="Conhecer os planos" onPress={() => navigation.navigate('Clube')} style={{ marginTop: 14 }} />
          </Card>
          <Eyebrow style={{ marginTop: 22 }}>O que já entregamos</Eyebrow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}>
            {IMAGENS.edicoes.map((img, i) => <Image key={i} source={img} style={st.miniEdicao} contentFit="cover" />)}
          </ScrollView>
          {!carregando && !user && (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 18 }}>
              <Text style={st.link}>Já é membro? Entrar</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </Tela>
  )
}

const st = StyleSheet.create({
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.bordaCard, alignItems: 'center', justifyContent: 'center' },
  edicao: { minHeight: 230, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.fundoSecundario, justifyContent: 'flex-end' },
  edicaoTexto: { color: colors.textoSecundario, fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 19, marginTop: 4 },
  pista: { color: colors.douradoClaro, fontFamily: fonts.serifItalico, fontSize: 17, lineHeight: 22 },
  edicaoInfo: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 90 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  bloco: { width: '48.5%', height: 104, backgroundColor: colors.fundoSecundario, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: 16, padding: 13, justifyContent: 'space-between' },
  blocoTitulo: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 14 },
  passo: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 12 },
  miniEdicao: { width: 220, height: 150, borderRadius: 16 },
  link: { color: colors.douradoClaro, textAlign: 'center', fontFamily: fonts.uiMedio },
})
