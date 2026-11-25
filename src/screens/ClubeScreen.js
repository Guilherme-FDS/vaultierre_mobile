// Clube (tela 3 aprovada: carrossel com foto). Essencial e Reserva, mensal ou anual.
import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Alert } from 'react-native'
import { Image } from 'expo-image'
import * as WebBrowser from 'expo-web-browser'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useMinhaConta, moeda } from '../services/dados'
import { Tela, Cabecalho, Titulo, Muted, Botao, Carregando, toque } from '../components/ui'
import Icone from '../components/Icone'
import { colors, fonts, IMAGENS } from '../theme'
import { SITE_URL } from '../config'

const LARGURA = Dimensions.get('window').width
const CARD = LARGURA - 36 - 44   // deixa o próximo card aparecendo
const ehReserva = (p) => /reserva/i.test(p?.nome || '')
const BENEFICIOS = (p) => ehReserva(p)
  ? ['2 rótulos raros por mês', 'Caixa dupla numerada', 'Dois cartões de degustação', 'Frete grátis']
  : ['1 rótulo raro por mês', 'Caixa numerada', 'Cartão de degustação', 'Frete grátis']

export default function ClubeScreen({ navigation }) {
  const { user } = useAuth()
  const { assinatura } = useMinhaConta()
  const [produtos, setProdutos] = useState(null)
  const [anual, setAnual] = useState(false)
  const [indice, setIndice] = useState(0)
  const lista = useRef(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/produtos/')
        const ativos = data.filter(p => p.ativo !== false)
        const completos = await Promise.all(ativos.map(p => api.get(`/produtos/${p.id}`).then(r => r.data)))
        completos.sort((a, b) => ehReserva(b) - ehReserva(a))   // Reserva primeiro (mais escolhido)
        setProdutos(completos)
      } catch { Alert.alert('Sem conexão', 'Não foi possível carregar os planos.'); setProdutos([]) }
    })()
  }, [])

  if (!produtos) return <Carregando />
  const plano = (p) => (p.planos || []).find(x => x.ativo !== false && x.recorrencia === (anual ? 'anual' : 'mensal'))
  const atual = produtos[indice]
  const meuPlano = assinatura?.id_produto

  function assinar() {
    const pl = atual && plano(atual)
    if (!pl) return
    if (assinatura) return navigation.navigate('Assinatura')
    const destino = { tela: 'Checkout', params: { produtoId: atual.id, planoId: pl.id } }
    if (!user) return navigation.navigate('Login', { depois: destino })
    navigation.navigate(destino.tela, destino.params)
  }

  return (
    <Tela>
      <Cabecalho eyebrow="O clube" titulo="Escolha seu plano" />
      <View style={st.seg}>
        {[['Mensal', false], ['Anual', true]].map(([t, v]) => (
          <TouchableOpacity key={t} style={[st.segItem, anual === v && st.segOn]} onPress={() => { toque(); setAnual(v) }}>
            <Text style={[st.segTxt, anual === v && { color: colors.texto }]}>{t}{v ? <Text style={{ color: colors.sucesso }}>  −12%</Text> : null}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList ref={lista} data={produtos} horizontal keyExtractor={p => String(p.id)} showsHorizontalScrollIndicator={false}
        snapToInterval={CARD + 12} decelerationRate="fast" style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}
        onMomentumScrollEnd={(e) => setIndice(Math.round(e.nativeEvent.contentOffset.x / (CARD + 12)))}
        renderItem={({ item: p }) => {
          const pl = plano(p)
          const destaque = ehReserva(p)
          return (
            <View style={[st.card, { width: CARD }, destaque && st.cardDestaque]}>
              <Image source={destaque ? IMAGENS.edicoes[2] : IMAGENS.edicoes[0]} style={st.foto} contentFit="cover" transition={200} />
              {meuPlano === p.id ? <View style={st.tag}><Text style={st.tagTxt}>Seu plano</Text></View>
                : destaque ? <View style={st.tag}><Text style={st.tagTxt}>Mais escolhido</Text></View> : null}
              <View style={{ padding: 16 }}>
                <Titulo tamanho={28}>{p.nome}</Titulo>
                {pl ? (
                  <Text style={st.preco}>{moeda(anual ? Number(pl.preco_total) / 12 : pl.preco_base)} <Text style={st.precoSub}>/mês</Text></Text>
                ) : <Muted>Indisponível</Muted>}
                {anual && pl ? <Muted style={{ marginBottom: 4 }}>{moeda(pl.preco_total)} à vista por 12 meses</Muted> : null}
                {BENEFICIOS(p).map(b => <Text key={b} style={st.benef}><Text style={{ color: colors.dourado }}>—  </Text>{b}</Text>)}
              </View>
            </View>
          )
        }} />
      <View style={st.dots}>{produtos.map((_, i) => <View key={i} style={[st.dot, i === indice && st.dotOn]} />)}</View>

      <Botao titulo={assinatura ? 'Ver minha assinatura' : `Assinar o ${atual?.nome || ''}`} onPress={assinar} style={{ marginTop: 14 }} />

      <TouchableOpacity style={st.quiz} onPress={() => WebBrowser.openBrowserAsync(`${SITE_URL}/quiz?utm_source=app`)}>
        <View style={st.quizIcone}><Icone nome="bussola" /></View>
        <View style={{ flex: 1 }}><Text style={st.quizT}>Em dúvida?</Text><Muted>Faça o quiz de paladar em 1 minuto</Muted></View>
        <Icone nome="seta" tamanho={16} cor="#5A544C" />
      </TouchableOpacity>
      <TouchableOpacity style={st.quiz} onPress={() => navigation.navigate('Corporativo')}>
        <View style={st.quizIcone}><Icone nome="empresa" /></View>
        <View style={{ flex: 1 }}><Text style={st.quizT}>Presentes corporativos</Text><Muted>Kits para clientes e equipes</Muted></View>
        <Icone nome="seta" tamanho={16} cor="#5A544C" />
      </TouchableOpacity>
    </Tela>
  )
}

const st = StyleSheet.create({
  seg: { flexDirection: 'row', backgroundColor: colors.fundoSecundario, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: colors.bordaCard, marginBottom: 14 },
  segItem: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segOn: { backgroundColor: colors.superficie2 },
  segTxt: { fontFamily: fonts.uiForte, fontSize: 12.5, color: colors.textoSecundario },
  card: { backgroundColor: colors.fundoSecundario, borderRadius: 20, borderWidth: 1, borderColor: colors.bordaCard, overflow: 'hidden' },
  cardDestaque: { borderColor: 'rgba(226,192,106,0.55)' },
  foto: { height: 170, width: '100%' },
  tag: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.douradoClaro, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  tagTxt: { fontFamily: fonts.uiNegrito, fontSize: 9.5, letterSpacing: 1.4, textTransform: 'uppercase', color: '#15120D' },
  preco: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 26, marginTop: 6 },
  precoSub: { fontFamily: fonts.ui, fontSize: 13, color: colors.textoSecundario },
  benef: { color: '#CFC8BC', fontFamily: fonts.ui, fontSize: 13, marginTop: 7 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4A4540' },
  dotOn: { width: 18, backgroundColor: colors.douradoClaro },
  quiz: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.fundoSecundario, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: 16, padding: 14, marginTop: 12 },
  quizIcone: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center' },
  quizT: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 14 },
})
