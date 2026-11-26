// Adega (tela 5 aprovada: lista com notas). Só mostra rótulos de caixas que o cliente confirmou
// ter recebido ("Já recebi minha caixa") — regra da surpresa garantida no backend (GET /adega).
import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { Image } from 'expo-image'
import { useFocusEffect } from '@react-navigation/native'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useMinhaConta } from '../services/dados'
import { Tela, Cabecalho, Card, Titulo, Muted, Eyebrow, Vazio, Carregando, toque } from '../components/ui'
import Estrelas from '../components/Estrelas'
import Icone from '../components/Icone'
import { colors, fonts } from '../theme'

const mesAno = (iso) => { const t = new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace(' de ', ' ').replace('.', ''); return t.charAt(0).toUpperCase() + t.slice(1) }

export default function AdegaScreen({ navigation }) {
  const { user } = useAuth()
  const { assinatura } = useMinhaConta()
  const [adega, setAdega] = useState(null)
  const carregar = useCallback(() => { if (user) api.get('/adega').then(r => setAdega(r.data)).catch(() => setAdega({ edicoes: [] })) }, [user])
  useFocusEffect(carregar)

  if (!user) return (
    <Tela><Cabecalho eyebrow="Minha adega" titulo="Seus rótulos" />
      <Vazio icone="adega" titulo="Sua adega começa aqui" texto="Cada garrafa que você receber vira uma ficha de degustação digital, com a história do rótulo e a sua nota." acao="Entrar" onAcao={() => navigation.navigate('Login')} />
    </Tela>
  )
  if (!adega) return <Carregando />

  const vazia = !adega.edicoes.length
  return (
    <Tela refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} tintColor={colors.dourado} />}>
      <Cabecalho eyebrow="Minha adega" titulo="Seus rótulos" />
      {vazia ? (
        assinatura ? (
          <Card destaque style={{ marginTop: 0 }}>
            <View style={st.linha}>
              <View style={st.icone}><Icone nome="caixa" tamanho={24} /></View>
              <View style={{ flex: 1 }}><Eyebrow>Sua primeira caixa</Eyebrow><Titulo tamanho={22}>A adega abre com ela</Titulo></View>
            </View>
            <Muted style={{ marginTop: 10, lineHeight: 19 }}>
              Para não estragar a surpresa, os rótulos ficam guardados. Quando a caixa chegar, toque em
              “Já recebi minha caixa” no Início e as fichas aparecem aqui para você avaliar.
            </Muted>
          </Card>
        ) : <Vazio icone="adega" titulo="Sua adega está vazia" texto="Assine um plano e cada garrafa recebida aparece aqui com a ficha de degustação." acao="Ver os planos" onAcao={() => navigation.navigate('Clube')} />
      ) : (
        <>
          <View style={st.numeros}>
            {[[adega.total_rotulos, adega.total_rotulos === 1 ? 'rótulo' : 'rótulos'], [adega.paises.length, adega.paises.length === 1 ? 'país' : 'países'], [adega.edicoes.length, adega.edicoes.length === 1 ? 'edição' : 'edições']].map(([n, t]) => (
              <View key={t} style={st.numero}><Text style={st.numeroN}>{n}</Text><Muted style={{ fontSize: 11.5 }}>{t}</Muted></View>
            ))}
          </View>
          {adega.edicoes.map(en => (
            <View key={en.id_envio}>
              <Eyebrow style={{ marginTop: 20, marginBottom: 2 }}>Nº {String(en.numero).padStart(2, '0')} · {en.edicao} · {mesAno(en.mes)}</Eyebrow>
              {en.rotulos.map(r => (
                <TouchableOpacity key={r.id} activeOpacity={0.85} onPress={() => { toque(); navigation.navigate('Revelacao', { entrada: en }) }} style={st.item}>
                  {r.foto_url ? <Image source={{ uri: r.foto_url }} style={st.foto} contentFit="cover" /> : <View style={[st.foto, st.semFoto]}><Icone nome="adega" /></View>}
                  <View style={{ flex: 1 }}>
                    <Text style={st.nome} numberOfLines={1}>{r.nome}</Text>
                    <Muted numberOfLines={1} style={{ fontSize: 12 }}>{[r.categoria, r.pais].filter(Boolean).join(' · ')}</Muted>
                    <View style={{ marginTop: 6 }}>{r.nota ? <Estrelas nota={r.nota} tamanho={13} /> : <Text style={st.avaliar}>Avaliar</Text>}</View>
                  </View>
                  <Icone nome="seta" tamanho={16} cor={colors.textoTerciario} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </>
      )}
    </Tela>
  )
}

const st = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icone: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center' },
  numeros: { flexDirection: 'row', gap: 10 },
  numero: { flex: 1, backgroundColor: colors.fundoSecundario, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  numeroN: { color: colors.douradoClaro, fontFamily: fonts.serif, fontSize: 30, lineHeight: 34 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.fundoSecundario, borderWidth: 1, borderColor: colors.bordaCard, borderRadius: 16, padding: 10, marginTop: 8 },
  foto: { width: 58, height: 72, borderRadius: 10, backgroundColor: colors.superficie2 },
  semFoto: { alignItems: 'center', justifyContent: 'center' },
  nome: { color: colors.texto, fontFamily: fonts.uiForte, fontSize: 14.5 },
  avaliar: { color: colors.douradoClaro, fontFamily: fonts.uiMedio, fontSize: 12 },
})
