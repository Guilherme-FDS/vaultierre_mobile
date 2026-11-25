// Legado: as telas antigas usam BotaoDourado; agora é o Botao do tema Noir.
import React from 'react'
import { Botao } from './ui'

export default function BotaoDourado({ title, onPress, outline, loading, style }) {
  return <Botao titulo={title} onPress={onPress} tipo={outline ? 'contorno' : 'ouro'} carregando={loading} style={style} />
}
