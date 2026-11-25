// Dados do cliente usados nas abas (assinatura viva, pedidos, posts).
import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import api from './api'
import { getPosts } from './strapi'
import { useAuth } from '../context/AuthContext'

const VIVAS = ['ativa', 'atrasada', 'pausada', 'pendente']
export const assinaturaViva = (lista = []) =>
  lista.find(a => VIVAS.includes(a.status)) ||
  lista.find(a => a.status === 'cancelada' && a.data_fim && new Date(a.data_fim + 'T23:59:59') >= new Date()) || null

export const ROTULO_STATUS = { pendente: 'Aguardando pagamento', ativa: 'Ativa', atrasada: 'Pagamento pendente', pausada: 'Pausada', cancelada: 'Cancelada', expirada: 'Encerrada' }
export const corStatus = (st) => ({ ativa: '#6FBF8E', pendente: '#E2C06A', atrasada: '#D8897E', pausada: '#9C958A', cancelada: '#9C958A' })[st] || '#9C958A'

export const dataCurta = (iso) => iso ? new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'
export const dataLonga = (iso) => iso ? new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : '—'
export const mesNome = (d) => d.toLocaleDateString('pt-BR', { month: 'long' })
export const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: Number(v) % 1 ? 2 : 0 })

// Carrega ao focar a aba (dados sempre atuais ao voltar do checkout, por exemplo)
export function useMinhaConta() {
  const { user } = useAuth()
  const [estado, setEstado] = useState({ carregando: true, assinatura: null, assinaturas: [], pedidos: [], perfil: null, enderecos: [] })
  const carregar = useCallback(async () => {
    if (!user) { setEstado(e => ({ ...e, carregando: false, assinatura: null, pedidos: [] })); return }
    try {
      const [a, p] = await Promise.all([api.get('/assinaturas/minhas'), api.get('/configuracoes/perfil')])
      setEstado({ carregando: false, assinaturas: a.data, assinatura: assinaturaViva(a.data), pedidos: p.data.pedidos || [],
        perfil: p.data.usuario, enderecos: p.data.enderecos || [] })
    } catch { setEstado(e => ({ ...e, carregando: false })) }
  }, [user])
  useFocusEffect(useCallback(() => { carregar() }, [carregar]))
  return { ...estado, recarregar: carregar }
}

export function usePosts(limite = 6) {
  const [posts, setPosts] = useState([])
  useFocusEffect(useCallback(() => {
    getPosts({ 'pagination[limit]': limite }).then(r => setPosts(Array.isArray(r) ? r : [])).catch(() => {})
  }, [limite]))
  return posts
}
