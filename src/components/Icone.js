// Ícones de traço fino (mesmo desenho dos protótipos). Sem emojis.
import React from 'react'
import Svg, { Path, Rect, Circle } from 'react-native-svg'
import { colors } from '../theme'

const P = {
  home: [['p', 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z']],
  clube: [['p', 'M8 2h8M9 2v5.5L6 12v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9l-3-4.5V2'], ['p', 'M6 14h12']],
  adega: [['r', 3, 3, 7, 7], ['r', 14, 3, 7, 7], ['r', 3, 14, 7, 7], ['r', 14, 14, 7, 7]],
  assinatura: [['r2', 3, 4, 18, 17], ['p', 'M3 9h18M8 2v4M16 2v4M7 14h4']],
  conta: [['c', 12, 8, 4], ['p', 'M4 21a8 8 0 0 1 16 0']],
  sino: [['p', 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'], ['p', 'M10.3 21a1.94 1.94 0 0 0 3.4 0']],
  bussola: [['c', 12, 12, 10], ['p', 'm16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z']],
  presente: [['p', 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z']],
  pin: [['p', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'], ['c', 12, 10, 3]],
  cadeado: [['r2', 5, 11, 14, 10], ['p', 'M8 11V7a4 4 0 0 1 8 0v4']],
  ajuda: [['c', 12, 12, 10], ['p', 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01']],
  livro: [['p', 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z']],
  caixa: [['p', 'M21 8 12 3 3 8v8l9 5 9-5z'], ['p', 'M3 8l9 5 9-5M12 13v8']],
  seta: [['p', 'm9 18 6-6-6-6']],
  voltar: [['p', 'm15 18-6-6 6-6']],
  sair: [['p', 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9']],
  documento: [['p', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'], ['p', 'M14 2v6h6M8 13h8M8 17h5']],
  mensagem: [['p', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z']],
  empresa: [['r2', 3, 7, 18, 14], ['p', 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2']],
  check: [['p', 'M20 6 9 17l-5-5']],
  estrela: [['p', 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z']],
}

export default function Icone({ nome, tamanho = 20, cor = colors.douradoClaro, espessura = 1.5, preenchido = false }) {
  const partes = P[nome] || []
  const props = { stroke: cor, strokeWidth: espessura, fill: preenchido ? cor : 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      {partes.map((p, i) => {
        if (p[0] === 'p') return <Path key={i} d={p[1]} {...props} />
        if (p[0] === 'c') return <Circle key={i} cx={p[1]} cy={p[2]} r={p[3]} {...props} />
        const rx = p[0] === 'r' ? 1.5 : 2
        return <Rect key={i} x={p[1]} y={p[2]} width={p[3]} height={p[4]} rx={rx} {...props} />
      })}
    </Svg>
  )
}
