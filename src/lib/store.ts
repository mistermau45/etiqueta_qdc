import { uid } from './id'
import { parseLista } from './parser'
import { AJUSTES_PADRAO, novoCircuito, STATE_VERSION } from './sample'
import type { Circuit, Estado, MargemId } from './types'

export type Acao =
  | { tipo: 'hidratar'; estado: Estado }
  | { tipo: 'definirNome'; nome: string }
  | { tipo: 'definirCliente'; cliente: string }
  | { tipo: 'definirModelo'; modelo: string }
  | { tipo: 'definirOpcao'; opcao: 'mostrarTabela' | 'margem'; valor: boolean | MargemId }
  | { tipo: 'addCircuito'; circuito?: Circuit }
  | { tipo: 'atualizarCircuito'; id: string; dados: Partial<Omit<Circuit, 'id'>> }
  | { tipo: 'removerCircuito'; id: string }
  | { tipo: 'duplicarCircuito'; id: string }
  | { tipo: 'moverCircuito'; id: string; direcao: -1 | 1 }
  | { tipo: 'renumerar' }
  | { tipo: 'importarLista'; texto: string }
  | { tipo: 'substituirTudo'; estado: Estado }
  | { tipo: 'limpar' }

function proximoNumero(circuitos: Circuit[]): string {
  const usados = new Set(
    circuitos.map((circuito) => Number.parseInt(circuito.numero, 10)).filter((n) => Number.isFinite(n)),
  )
  let candidato = 1
  while (usados.has(candidato)) candidato += 1
  return String(candidato)
}

function mapear(estado: Estado, circuitos: Circuit[]): Estado {
  return { ...estado, projeto: { ...estado.projeto, circuitos } }
}

export function reducer(estado: Estado, acao: Acao): Estado {
  const { circuitos } = estado.projeto

  switch (acao.tipo) {
    case 'hidratar':
      return acao.estado

    case 'definirNome':
      return { ...estado, projeto: { ...estado.projeto, nome: acao.nome } }

    case 'definirCliente':
      return { ...estado, projeto: { ...estado.projeto, cliente: acao.cliente } }

    case 'definirModelo':
      return { ...estado, projeto: { ...estado.projeto, modelo: acao.modelo } }

    case 'definirOpcao':
      return {
        ...estado,
        ajustes: {
          ...estado.ajustes,
          opcoes: { ...estado.ajustes.opcoes, [acao.opcao]: acao.valor },
        },
      }

    case 'addCircuito':
      return mapear(estado, [...circuitos, acao.circuito ?? novoCircuito(proximoNumero(circuitos))])

    case 'atualizarCircuito':
      return mapear(
        estado,
        circuitos.map((circuito) =>
          circuito.id === acao.id ? { ...circuito, ...acao.dados } : circuito,
        ),
      )

    case 'removerCircuito':
      return mapear(estado, circuitos.filter((circuito) => circuito.id !== acao.id))

    case 'duplicarCircuito': {
      const indice = circuitos.findIndex((circuito) => circuito.id === acao.id)
      if (indice < 0) return estado
      const original = circuitos[indice]
      const copia = { ...original, id: uid() }
      const proximos = [...circuitos]
      proximos.splice(indice + 1, 0, copia)
      return mapear(estado, proximos)
    }

    case 'moverCircuito': {
      const indice = circuitos.findIndex((circuito) => circuito.id === acao.id)
      const destino = indice + acao.direcao
      if (indice < 0 || destino < 0 || destino >= circuitos.length) return estado
      const proximos = [...circuitos]
      const [movido] = proximos.splice(indice, 1)
      proximos.splice(destino, 0, movido)
      return mapear(estado, proximos)
    }

    case 'renumerar': {
      let geralEncontrado = false
      return mapear(
        estado,
        circuitos.map((circuito, indice) => {
          if (circuito.tipo === 'geral' && !geralEncontrado) {
            geralEncontrado = true
            return { ...circuito, numero: 'GERAL' }
          }
          return { ...circuito, numero: String(indice + 1) }
        }),
      )
    }

    case 'importarLista': {
      const novos = parseLista(acao.texto)
      if (novos.length === 0) return estado
      return mapear(estado, [...circuitos, ...novos])
    }

    case 'substituirTudo':
      return acao.estado

    case 'limpar':
      return {
        versao: STATE_VERSION,
        projeto: { ...estado.projeto, circuitos: [] },
        ajustes: { ...estado.ajustes },
      }

    default:
      return estado
  }
}

export { AJUSTES_PADRAO }
