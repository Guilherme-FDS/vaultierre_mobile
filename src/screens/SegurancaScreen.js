// Segurança: trocar a senha.
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform } from 'react-native'
import api from '../services/api'
import { validarSenha } from '../utils/validarSenha'
import { msgErro } from '../utils/mascaras'
import { Tela, Cabecalho, Botao, Entrada, Muted } from '../components/ui'
import { colors } from '../theme'

export default function SegurancaScreen() {
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [conf, setConf] = useState('')
  const [salvando, setSalvando] = useState(false)
  const erroNova = nova ? validarSenha(nova) : null

  async function trocar() {
    if (!atual || !nova || !conf) return Alert.alert('Atenção', 'Preencha todos os campos.')
    if (erroNova) return Alert.alert('Atenção', erroNova)
    if (nova !== conf) return Alert.alert('Atenção', 'As senhas não coincidem.')
    setSalvando(true)
    try {
      await api.put('/configuracoes/senha', { senha_atual: atual, nova_senha: nova })
      Alert.alert('Pronto', 'Senha alterada.')
      setAtual(''); setNova(''); setConf('')
    } catch (e) { Alert.alert('Ops', msgErro(e, 'Não foi possível alterar a senha.')) } finally { setSalvando(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela abas={false}>
        <Cabecalho eyebrow="Conta" titulo="Segurança" />
        <Muted style={{ marginTop: -8, marginBottom: 18, lineHeight: 19 }}>Se você entra com Google ou Apple, não precisa de senha.</Muted>
        <Entrada rotulo="Senha atual" value={atual} onChangeText={setAtual} secureTextEntry textContentType="password" />
        <Entrada rotulo="Nova senha" value={nova} onChangeText={setNova} secureTextEntry textContentType="newPassword" />
        {erroNova ? <Muted style={{ color: colors.erro, marginTop: -8, marginBottom: 10 }}>{erroNova}</Muted> : null}
        <Entrada rotulo="Confirmar nova senha" value={conf} onChangeText={setConf} secureTextEntry textContentType="newPassword" />
        <Botao titulo="Alterar senha" onPress={trocar} carregando={salvando} style={{ marginTop: 8 }} />
      </Tela>
    </KeyboardAvoidingView>
  )
}
