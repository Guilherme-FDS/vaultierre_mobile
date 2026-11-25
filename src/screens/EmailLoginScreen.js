// Entrar ou criar conta com e-mail. Cadastro enxuto: nome completo, e-mail, senha e nascimento.
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { validarSenha } from '../utils/validarSenha'
import { Tela, Titulo, Muted, Eyebrow, Botao, Entrada } from '../components/ui'
import { colors, fonts } from '../theme'

const mascaraData = (v) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2')
function dataIso(br) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br)
  if (!m) return null
  const d = new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00`)
  return isNaN(d) || d.getDate() !== Number(m[1]) ? null : `${m[3]}-${m[2]}-${m[1]}`
}
function idade(iso) {
  const n = new Date(iso + 'T12:00:00'), h = new Date()
  return h.getFullYear() - n.getFullYear() - ((h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) ? 1 : 0)
}
const msgErro = (e, padrao) => {
  const d = e?.response?.data?.detail
  if (Array.isArray(d)) return d.map(x => String(x.msg || '').replace(/^Value error, /, '')).join('\n')
  return typeof d === 'string' ? d : padrao
}

export default function EmailLoginScreen({ navigation, route }) {
  const { login, cadastro } = useAuth()
  const [modo, setModo] = useState(route?.params?.modo || 'entrar')   // entrar | cadastro | senha
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [carregando, setCarregando] = useState(false)
  const depois = route?.params?.depois

  function concluir() {
    const pilha = navigation.getState()?.routes?.length || 1
    if (depois) { navigation.pop(Math.min(2, pilha - 1)); navigation.navigate(depois.tela, depois.params) }
    else navigation.pop(Math.min(2, pilha - 1))
  }

  async function enviar() {
    setCarregando(true)
    try {
      if (modo === 'senha') {
        if (!email.trim()) return Alert.alert('Atenção', 'Informe o e-mail.')
        await api.post('/auth/esqueceu-senha', { email: email.trim() })
        Alert.alert('Pronto', 'Se o e-mail estiver cadastrado, você vai receber o link para criar uma nova senha.')
        return setModo('entrar')
      }
      if (modo === 'entrar') {
        if (!email.trim() || !senha) return Alert.alert('Atenção', 'Preencha e-mail e senha.')
        await login(email.trim(), senha)
        return concluir()
      }
      if (nome.trim().split(/\s+/).length < 2) return Alert.alert('Atenção', 'Informe nome e sobrenome.')
      const iso = dataIso(nascimento)
      if (!iso) return Alert.alert('Atenção', 'Informe a data de nascimento (dd/mm/aaaa).')
      if (idade(iso) < 18) return Alert.alert('Atenção', 'O cadastro é permitido apenas para maiores de 18 anos.')
      const erroSenha = validarSenha(senha)
      if (erroSenha) return Alert.alert('Senha', erroSenha)
      await cadastro({ nome_completo: nome.trim(), email: email.trim(), senha, data_nascimento: iso })
      concluir()
    } catch (e) {
      Alert.alert('Ops', msgErro(e, modo === 'entrar' ? 'E-mail ou senha inválidos.' : 'Não foi possível concluir. Tente novamente.'))
    } finally { setCarregando(false) }
  }

  const titulos = { entrar: 'Entrar', cadastro: 'Criar conta', senha: 'Recuperar senha' }
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela abas={false} contentStyle={{ paddingTop: 12 }}>
        <Eyebrow>Vaultierre</Eyebrow>
        <Titulo tamanho={34}>{titulos[modo]}</Titulo>
        <Muted style={{ marginTop: 6, marginBottom: 22, fontSize: 13.5, lineHeight: 20 }}>
          {modo === 'cadastro' ? 'Leva 30 segundos. CPF e celular só pedimos na hora da compra.'
            : modo === 'senha' ? 'Enviaremos um link para você criar uma nova senha.' : 'Bem-vindo de volta.'}
        </Muted>
        {modo === 'cadastro' && <Entrada rotulo="Nome completo" value={nome} onChangeText={setNome} placeholder="Como está no seu documento" autoComplete="name" textContentType="name" />}
        <Entrada rotulo="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
        {modo !== 'senha' && <Entrada rotulo="Senha" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry autoComplete={modo === 'cadastro' ? 'new-password' : 'password'} textContentType={modo === 'cadastro' ? 'newPassword' : 'password'} />}
        {modo === 'cadastro' && <Entrada rotulo="Data de nascimento" value={nascimento} onChangeText={(v) => setNascimento(mascaraData(v))} placeholder="dd/mm/aaaa" keyboardType="number-pad" maxLength={10} />}
        {modo === 'entrar' && (
          <TouchableOpacity onPress={() => setModo('senha')} style={{ alignSelf: 'flex-end', marginTop: -4, marginBottom: 14 }}>
            <Text style={{ color: colors.douradoClaro, fontFamily: fonts.uiMedio, fontSize: 13 }}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        )}
        <Botao titulo={modo === 'entrar' ? 'Entrar' : modo === 'cadastro' ? 'Criar conta' : 'Enviar link'} onPress={enviar} carregando={carregando} style={{ marginTop: 6 }} />
        <TouchableOpacity onPress={() => setModo(modo === 'cadastro' ? 'entrar' : 'cadastro')} style={{ marginTop: 18 }}>
          <Text style={{ color: colors.textoSecundario, textAlign: 'center', fontFamily: fonts.ui }}>
            {modo === 'cadastro' ? 'Já tem conta? ' : 'Ainda não tem conta? '}
            <Text style={{ color: colors.douradoClaro, fontFamily: fonts.uiForte }}>{modo === 'cadastro' ? 'Entrar' : 'Criar conta'}</Text>
          </Text>
        </TouchableOpacity>
      </Tela>
    </KeyboardAvoidingView>
  )
}
