// Tema "Noir" — escuro como uma adega, ouro só nos detalhes (proposta aprovada em 25/11/2026).
// Os nomes antigos (fundo, texto, dourado...) continuam valendo para as telas secundárias.
export const colors = {
  fundo: '#0E0D0C',
  fundoSecundario: '#171513',
  fundoCard: '#171513',
  superficie2: '#1F1C19',
  texto: '#F3EEE4',
  textoSecundario: '#9C958A',
  textoTerciario: '#6E685F',
  dourado: '#C9A84C',
  douradoClaro: '#E2C06A',
  douradoEscuro: '#9E7A2E',
  roxo: '#C9A84C',          // legado: roxo saiu da marca
  roxoClaro: '#E2C06A',
  sucesso: '#6FBF8E',
  erro: '#D8897E',
  borda: 'rgba(201, 168, 76, 0.28)',
  bordaCard: 'rgba(201, 168, 76, 0.16)',
  linhaSutil: 'rgba(255, 255, 255, 0.06)',
  heroDark: '#0E0D0C',
  marfim: '#F3EEE4',
}

export const fonts = {
  serif: 'CormorantGaramond_500Medium',
  serifItalico: 'CormorantGaramond_400Regular_Italic',
  ui: 'DMSans_400Regular',
  uiMedio: 'DMSans_500Medium',
  uiForte: 'DMSans_600SemiBold',
  uiNegrito: 'DMSans_700Bold',
}

export const gradients = {
  dourado: ['#E2C06A', '#C9A84C', '#9E7A2E'],
  hero: ['rgba(14,13,12,0.1)', 'rgba(14,13,12,0.6)', '#0E0D0C'],
  destaque: ['#241F18', '#171513'],
}

export const spacing = { xs: 8, sm: 12, md: 18, lg: 24, xl: 40 }
export const radius = { sm: 10, md: 16, lg: 20, xl: 22, pill: 999 }

export const shadow = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
  forte: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 8 },
}

// Imagem de fundo da tela de boas-vindas: troque aqui quando tiver a foto da caixa vazia.
export const IMAGENS = {
  boasVindas: require('../assets/img/hero-vaultierre.webp'),
  edicaoDestaque: require('../assets/img/entrega-dassai-diplomatico.webp'),
  edicoes: [
    require('../assets/img/hero-vaultierre.webp'),
    require('../assets/img/entrega-dassai-diplomatico.webp'),
    require('../assets/img/entrega-monkey-clase-azul.webp'),
  ],
  selo: require('../assets/img/selo-vaultierre.png'),
}
