// Máscaras e validações de formulário (cadastro, checkout, perfil).
export const mascaraData = (v) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2')
export const mascaraCpf = (v) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
export const mascaraTel = (v) => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2')
export const mascaraCep = (v) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')

export function dataIso(br) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br || '')
  if (!m) return null
  const d = new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00`)
  return isNaN(d) || d.getDate() !== Number(m[1]) ? null : `${m[3]}-${m[2]}-${m[1]}`
}
export const isoParaBr = (iso) => iso ? iso.slice(0, 10).split('-').reverse().join('/') : ''
export function idade(iso) {
  const n = new Date(iso + 'T12:00:00'), h = new Date()
  return h.getFullYear() - n.getFullYear() - ((h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) ? 1 : 0)
}
export function cpfValido(v) {
  const d = String(v).replace(/\D/g, '').split('').map(Number)
  if (d.length !== 11 || new Set(d).size === 1) return false
  for (const n of [9, 10]) {
    const soma = d.slice(0, n).reduce((s, x, i) => s + x * (n + 1 - i), 0)
    if ((soma * 10 % 11) % 10 !== d[n]) return false
  }
  return true
}
export function msgErro(e, padrao) {
  const d = e?.response?.data?.detail
  if (Array.isArray(d)) return d.map(x => String(x.msg || '').replace(/^Value error, /, '')).join('\n')
  return typeof d === 'string' ? d : padrao
}
