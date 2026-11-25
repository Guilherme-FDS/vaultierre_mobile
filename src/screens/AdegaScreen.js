// Adega (tela 5 aprovada: lista com notas). As fichas só aparecem depois que o cliente
// confirma "Já recebi minha caixa" (regra da surpresa — docs/redesign/adega.md).
// O backend das edições ainda não existe: por enquanto mostra a explicação e o estado vazio.
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useMinhaConta } from '../services/dados'
import { Tela, Cabecalho, Card, Titulo, Muted, Eyebrow, Vazio } from '../components/ui'
import Icone from '../components/Icone'
import { colors } from '../theme'

export default function AdegaScreen({ navigation }) {
  const { user } = useAuth()
  const { assinatura } = useMinhaConta()
  return (
    <Tela>
      <Cabecalho eyebrow="Minha adega" titulo="Seus rótulos" />
      {!user ? (
        <Vazio icone="adega" titulo="Sua adega começa aqui" texto="Cada garrafa que você receber vira uma ficha de degustação digital, com a história do rótulo e a sua nota." acao="Entrar" onAcao={() => navigation.navigate('Login')} />
      ) : !assinatura ? (
        <Vazio icone="adega" titulo="Sua adega está vazia" texto="Assine um plano e cada garrafa recebida aparece aqui com a ficha de degustação." acao="Ver os planos" onAcao={() => navigation.navigate('Clube')} />
      ) : (
        <>
          <Card destaque style={{ marginTop: 0 }}>
            <View style={st.linha}>
              <View style={st.icone}><Icone nome="caixa" tamanho={24} /></View>
              <View style={{ flex: 1 }}>
                <Eyebrow>Próxima edição</Eyebrow>
                <Titulo tamanho={22}>Sua caixa está a caminho</Titulo>
              </View>
            </View>
            <Muted style={{ marginTop: 10, lineHeight: 19 }}>
              Para não estragar a surpresa, os rótulos ficam guardados. Quando a caixa chegar, toque em
              “Já recebi minha caixa” e as fichas de degustação aparecem aqui para você avaliar.
            </Muted>
          </Card>
          <Vazio icone="estrela" titulo="Nenhum rótulo ainda" texto="As garrafas das edições recebidas aparecem nesta lista, com notas de degustação e a sua avaliação." />
        </>
      )}
    </Tela>
  )
}

const st = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icone: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(201,168,76,0.12)', alignItems: 'center', justifyContent: 'center' },
})
