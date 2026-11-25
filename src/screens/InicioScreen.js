// Início (tela 2 aprovada): edição do mês + 4 blocos para o assinante; vitrine para o visitante.
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native'
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
function falta(alvo) {
  const ms = Math.max(0, alvo - Date.now())
  return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60 }
}

function CartaoEdicao({ alvo, onPress }) {
  const [t, setT] = useState(falta(alvo))
  useEffect(() => { const id = setInterval(() => setT(falta(alvo)), 30000); return () => clearInterval(id) }, [alvo])
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => { toque(); onPress?.() }} style={st.edicao}>
      <Image source={IMAGENS.edicaoDestaque} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      <LinearGradient colors={['transparent', 'rgba(14,13,12,0.92)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
      <View style={st.edicaoInfo}>
        <Eyebrow>Edição de {mesNome(new Date(alvo))}</Eyebrow>
        <Titulo tamanho={24} style={{ marginBottom: 10 }}>A revelação está chegando</Titulo>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[[t.d, 'dias'], [t.h, 'h'], [t.m, 'min']].map(([n, u]) => (
            <View key={u} style={st.chip}><Text style={st.chipTxt}><Text style={{ color: colors.douradoClaro }}>{pad(n)}</Text> {u}</Text></View>
          ))}
        </View>
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

  // A revelação acompanha o próximo ciclo da assinatura; sem assinatura, o 1º dia do mês que vem
  const proximoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1, 9)
  const alvo = assinatura?.proximo_ciclo ? new Date(assinatura.proximo_ciclo + 'T09:00:00').getTime() : proximoMes.getTime()

  return (
    <Tela refreshControl={<RefreshControl refreshing={false} onRefresh={recarregar} tintColor={colors.dourado} />}>
      <Cabecalho eyebrow={user ? saudacao() : 'Vaultierre'} titulo={user ? nome || 'Membro' : 'Raro por natureza'}
        direita={<TouchableOpacity style={st.avatar} onPress={() => navigation.navigate(user ? 'Conta' : 'Login')}><Icone nome={user ? 'sino' : 'conta'} /></TouchableOpacity>} />

      <CartaoEdicao alvo={alvo} onPress={() => navigation.navigate(assinatura ? 'Assinatura' : 'Clube')} />

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
            {[['clube', 'Escolha o plano', 'Essencial (1 rótulo) ou Reserva (2 rótulos).'],
              ['caixa', 'Receba todo mês', 'Caixa numerada, frete grátis, cartão de degustação.'],
              ['bussola', 'Descubra o paladar', 'A curadoria escolhe a portas fechadas.']].map(([ic, t, d]) => (
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
  edicao: { height: 220, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.fundoSecundario },
  edicaoInfo: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  chip: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  chipTxt: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 11.5 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  bloco: { width: '48.5%', height: 104, backgroundColor: colors.fundoSecundario, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: 16, padding: 13, justifyContent: 'space-between' },
  blocoTitulo: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 14 },
  passo: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 12 },
  miniEdicao: { width: 220, height: 150, borderRadius: 16 },
  link: { color: colors.douradoClaro, textAlign: 'center', fontFamily: fonts.uiMedio },
})
