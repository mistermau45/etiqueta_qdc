import { uid } from './id'
import { parseLista } from './parser'
import type { Ajustes, Estado } from './types'

export const STORAGE_KEY = 'quadro-identificado:v1'
export const STATE_VERSION = 1

export const AJUSTES_PADRAO: Ajustes = {
  nome: '',
  cliente: '',
  modelo: 'custom',
  opcoes: {
    mostrarTabela: true,
    margem: 'sem-margem',
  },
}

export function criarProjetoExemplo(): Estado {
  const linhas = [
    'GERAL | geral | Quadro | 63 A',
    'DPS | dps | Entrada |',
    'DR | dr | Diferencial geral | 40 A',
    '1 | iluminacao | Sala, Hall | 10 A',
    '2 | iluminacao | Quartos | 10 A',
    '3 | tomadas | Sala | 20 A',
    '4 | tomadas | Quartos | 20 A',
    '5 | cooktop | Cozinha | 20 A',
    '6 | chuveiro | Suíte | 20 A',
  ]

  return {
    versao: STATE_VERSION,
    projeto: {
      nome: 'Residência exemplo',
      cliente: '',
      modelo: 'weg-24',
      circuitos: parseLista(linhas.join('\n')),
    },
    ajustes: { ...AJUSTES_PADRAO },
  }
}

export function estadoVazio(): Estado {
  return {
    versao: STATE_VERSION,
    projeto: { nome: '', cliente: '', modelo: 'custom', circuitos: [] },
    ajustes: { ...AJUSTES_PADRAO },
  }
}

export function novoCircuito(numero: string) {
  return { id: uid(), numero, tipo: 'tomadas' as const, ambiente: '', amperagem: '' }
}
