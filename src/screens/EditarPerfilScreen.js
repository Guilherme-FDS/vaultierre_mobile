// Meus dados: nome completo, e-mail, celular, nascimento e CPF (CPF não muda depois de gravado).
import React, { useCallback, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../services/api'
import { Tela, Cabecalho, Botao, Entrada, Carregando, Muted } from '../components/ui'
import { mascaraCpf, mascaraTel, mascaraData, dataIso, isoParaBr, cpfValido, msgErro } from '../utils/mascaras'
import { colors } from '../theme'

export default function EditarPerfilScreen() {
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [f, setF] = useState({ nome: '', email: '', tel: '', nasc: '', cpf: '' })
  const [cpfTravado, setCpfTravado] = useState(false)
  const muda = (k) => (v) => setF(x => ({ ...x, [k]: v }))

  useFocusEffect(useCallback(() => {
    api.get('/configuracoes/perfil').then(({ data }) => {
      const u = data.usuario || {}
      setF({ nome: `${u.nome || ''} ${u.sobrenome || ''}`.trim(), email: u.email || '', tel: u.telefone ? mascaraTel(u.telefone) : '',
        nasc: isoParaBr(u.data_nascimento), cpf: u.cpf ? mascaraCpf(u.cpf) : '' })
      setCpfTravado(!!u.cpf)
    }).catch(() => Alert.alert('Ops', 'Não foi possível carregar seus dados.')).finally(() => setCarregando(false))
  }, []))

  async function salvar() {
    const partes = f.nome.trim().split(/\s+/)
    if (partes.length < 2) return Alert.alert('Atenção', 'Informe nome e sobrenome.')
    const nasc = f.nasc ? dataIso(f.nasc) : null
    if (f.nasc && !nasc) return Alert.alert('Atenção', 'Data de nascimento inválida (dd/mm/aaaa).')
    if (!cpfTravado && f.cpf && !cpfValido(f.cpf)) return Alert.alert('Atenção', 'Confira o CPF.')
    setSalvando(true)
    try {
      const { data } = await api.put('/configuracoes/perfil', {
        nome: partes[0], sobrenome: partes.slice(1).join(' '), email: f.email.trim(),
        telefone: f.tel.replace(/\D/g, '') || null, data_nascimento: nasc,
        ...(!cpfTravado && f.cpf ? { cpf: f.cpf.replace(/\D/g, '') } : {}),
      })
      setCpfTravado(!!data.cpf)
      Alert.alert('Pronto', 'Seus dados foram atualizados.')
    } catch (e) { Alert.alert('Ops', msgErro(e, 'Não foi possível salvar.')) } finally { setSalvando(false) }
  }

  if (carregando) return <Carregando />
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela abas={false}>
        <Cabecalho eyebrow="Conta" titulo="Meus dados" />
        <Entrada rotulo="Nome completo" value={f.nome} onChangeText={muda('nome')} autoComplete="name" />
        <Entrada rotulo="E-mail" value={f.email} onChangeText={muda('email')} autoCapitalize="none" keyboardType="email-address" />
        <Entrada rotulo="Celular com DDD" value={f.tel} onChangeText={v => muda('tel')(mascaraTel(v))} keyboardType="phone-pad" placeholder="(00) 00000-0000" />
        <Entrada rotulo="Data de nascimento" value={f.nasc} onChangeText={v => muda('nasc')(mascaraData(v))} keyboardType="number-pad" placeholder="dd/mm/aaaa" maxLength={10} />
        <Entrada rotulo="CPF" value={f.cpf} onChangeText={v => muda('cpf')(mascaraCpf(v))} keyboardType="number-pad" placeholder="000.000.000-00" editable={!cpfTravado} style={cpfTravado && { opacity: 0.55 }} />
        {cpfTravado ? <Muted style={{ marginTop: -8, marginBottom: 8 }}>Para alterar o CPF, fale com o suporte.</Muted> : null}
        <Botao titulo="Salvar" onPress={salvar} carregando={salvando} style={{ marginTop: 8 }} />
      </Tela>
    </KeyboardAvoidingView>
  )
}
