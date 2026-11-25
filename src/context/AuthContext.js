import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'
import { registrarPush, removerPush } from '../services/push'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    restoreSession()
  }, [])

  async function restoreSession() {
    try {
      const token = await AsyncStorage.getItem('token')
      if (token) {
        const { data } = await api.get('/auth/me')
        setUser(data)
        registrarPush()
      }
    } catch {
      await AsyncStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  async function login(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha, guest_carrinho: [] })
    const token = data.access_token || data.token
    await AsyncStorage.setItem('token', token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    registrarPush()
    return me.data
  }

  async function loginOAuth(code, provider) {
    const { data } = await api.post('/auth/oauth/callback', { code, provider, guest_carrinho: [] })
    const token = data.access_token || data.token
    await AsyncStorage.setItem('token', token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    registrarPush()
    return me.data
  }

  // Login que já volta com o token da sessão (Apple)
  async function loginComToken(token) {
    await AsyncStorage.setItem('token', token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    registrarPush()
    return me.data
  }

  async function loginAppleNativo({ identityToken, nome, sobrenome }) {
    const { data } = await api.post('/auth/apple/nativo', { identity_token: identityToken, nome: nome || '', sobrenome: sobrenome || '' })
    return loginComToken(data.token)
  }

  async function excluirConta() {
    await removerPush()
    await api.delete('/auth/conta')
    await AsyncStorage.removeItem('token')
    setUser(null)
  }

  // Cadastro enxuto: { nome_completo, email, senha, data_nascimento } (CPF e celular só na compra)
  async function cadastro(campos) {
    await api.post('/auth/cadastro', campos)
    return login(campos.email, campos.senha)
  }

  async function logout() {
    await removerPush()
    try { await api.post('/auth/logout') } catch {}
    await AsyncStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginOAuth, loginComToken, loginAppleNativo, excluirConta, cadastro, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
