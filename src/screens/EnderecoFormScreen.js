// Novo/editar endereço: o CEP preenche rua, bairro, cidade e estado.
import React, { useState } from 'react'
import { View, Text, Alert, Switch, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import api from '../services/api'
import { buscarCEP } from '../utils/cep'
import { mascaraCep, msgErro } from '../utils/mascaras'
import { Tela, Cabecalho, Botao, Entrada, Muted } from '../components/ui'
import { colors, fonts } from '../theme'

export default function EnderecoFormScreen({ navigation, route }) {
  const e = route.params?.endereco ?? null
  const [f, setF] = useState({ cep: e?.cep ? mascaraCep(String(e.cep)) : '', endereco: e?.endereco ?? '', numero: e?.numero ?? '',
    complemento: e?.complemento ?? '', bairro: e?.bairro ?? '', cidade: e?.cidade ?? '', estado: e?.estado ?? '', principal: e?.principal ?? false })
  const [buscando, setBuscando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const muda = (k) => (v) => setF(x => ({ ...x, [k]: v }))

  async function cep(v) {
    const m = mascaraCep(v)
    muda('cep')(m)
    if (m.replace(/\D/g, '').length !== 8) return
    setBuscando(true)
    try {
      const d = await buscarCEP(m)
      if (!d) return Alert.alert('CEP não encontrado', 'Confira o CEP.')
      setF(x => ({ ...x, endereco: d.endereco || x.endereco, bairro: d.bairro || x.bairro, cidade: d.cidade || x.cidade, estado: d.estado || x.estado }))
    } catch { /* sem rede: preenche à mão */ } finally { setBuscando(false) }
  }

  async function salvar() {
    if (!f.cep || !f.endereco || !f.numero || !f.bairro || !f.cidade || !f.estado) return Alert.alert('Atenção', 'Preencha os campos obrigatórios.')
    setSalvando(true)
    const payload = { tipo: 'residencial', cep: f.cep.replace(/\D/g, ''), endereco: f.endereco, numero: f.numero, complemento: f.complemento || null,
      bairro: f.bairro, cidade: f.cidade, estado: f.estado.toUpperCase(), pais: 'Brasil', principal: f.principal }
    try {
      if (e) await api.put(`/configuracoes/enderecos/${e.id}`, payload)
      else await api.post('/configuracoes/enderecos', payload)
      navigation.goBack()
    } catch (err) { Alert.alert('Ops', msgErro(err, 'Não foi possível salvar o endereço.')) } finally { setSalvando(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.fundo }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela abas={false}>
        <Cabecalho eyebrow="Entrega" titulo={e ? 'Editar endereço' : 'Novo endereço'} direita={buscando ? <ActivityIndicator color={colors.dourado} /> : null} />
        <Entrada rotulo="CEP" value={f.cep} onChangeText={cep} keyboardType="number-pad" placeholder="00000-000" maxLength={9} />
        <Entrada rotulo="Rua" value={f.endereco} onChangeText={muda('endereco')} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Entrada rotulo="Número" value={f.numero} onChangeText={muda('numero')} keyboardType="number-pad" /></View>
          <View style={{ flex: 2 }}><Entrada rotulo="Complemento" value={f.complemento} onChangeText={muda('complemento')} placeholder="Opcional" /></View>
        </View>
        <Entrada rotulo="Bairro" value={f.bairro} onChangeText={muda('bairro')} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 3 }}><Entrada rotulo="Cidade" value={f.cidade} onChangeText={muda('cidade')} /></View>
          <View style={{ flex: 1 }}><Entrada rotulo="UF" value={f.estado} onChangeText={v => muda('estado')(v.toUpperCase())} maxLength={2} autoCapitalize="characters" /></View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 }}>
          <Text style={{ color: colors.texto, fontFamily: fonts.ui, fontSize: 14 }}>Endereço principal</Text>
          <Switch value={f.principal} onValueChange={muda('principal')} trackColor={{ true: colors.dourado, false: '#3A3631' }} thumbColor={colors.marfim} />
        </View>
        <Muted style={{ marginBottom: 12 }}>As caixas vão para o endereço escolhido na assinatura.</Muted>
        <Botao titulo="Salvar endereço" onPress={salvar} carregando={salvando} />
      </Tela>
    </KeyboardAvoidingView>
  )
}
