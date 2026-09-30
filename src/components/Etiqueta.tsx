import { getCircuitType } from '../lib/circuitTypes'
import type { Circuit } from '../lib/types'
import { luminancia } from '../lib/pdf/layout'
import Icone from './Icone'

interface Props {
  circuito: Circuit
  detalhe?: string
}

export default function Etiqueta({ circuito, detalhe }: Props) {
  const tipo = getCircuitType(circuito.tipo)
  const contraste = luminancia(tipo.color) > 0.58
  const rodape =
    detalhe ??
    ([circuito.ambiente, circuito.amperagem].filter(Boolean).join(' ') ||
      (circuito.tipo === 'geral' ? 'Disjuntor geral' : 'Circuito'))

  return (
    <div className="etiqueta" style={{ '--cor': tipo.color } as React.CSSProperties}>
      <span className="etiqueta-numero" data-contraste={contraste ? 'escuro' : 'claro'}>
        {circuito.numero}
      </span>
      <Icone nome={tipo.icon} />
      <p className="etiqueta-nome">{tipo.label}</p>
      <p className="etiqueta-detalhe">{rodape}</p>
    </div>
  )
}
