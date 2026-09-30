import { AJUSTES_PADRAO, estadoVazio, STATE_VERSION, STORAGE_KEY } from './sample'
import { CIRCUIT_TYPES } from './circuitTypes'
import type { Ajustes, Circuit, CircuitTypeId, Estado, MargemId } from './types'

const MARGENS: MargemId[] = ['sem-margem', '5mm', '10mm']

function isRecord(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function texto(valor: unknown, padrao = ''): string {
  return typeof valor === 'string' ? valor : padrao
}

function sanitizarTipo(valor: unknown): CircuitTypeId {
  const id = typeof valor === 'string' ? valor : 'outros'
  return CIRCUIT_TYPES.some((type) => type.id === id) ? (id as CircuitTypeId) : 'outros'
}

function sanitizarCircuito(valor: unknown): Circuit | null {
  if (!isRecord(valor)) return null
  const numero = texto(valor.numero).trim()
  if (!numero) return null
  return {
    id: texto(valor.id) || Math.random().toString(36).slice(2),
    numero,
    tipo: sanitizarTipo(valor.tipo),
    ambiente: texto(valor.ambiente).slice(0, 80),
    amperagem: texto(valor.amperagem).slice(0, 16),
  }
}

function sanitizarAjustes(valor: unknown): Ajustes {
  const base = isRecord(valor) ? valor : {}
  const opcoes = isRecord(base.opcoes) ? base.opcoes : {}
  const margem = texto(opcoes.margem) as MargemId

  return {
    nome: texto(base.nome).slice(0, 80),
    cliente: texto(base.cliente).slice(0, 80),
    modelo: texto(base.modelo, 'custom'),
    opcoes: {
      mostrarTabela: opcoes.mostrarTabela !== false,
      margem: MARGENS.includes(margem) ? margem : AJUSTES_PADRAO.opcoes.margem,
    },
  }
}

export function sanitizarEstado(valor: unknown): Estado {
  if (!isRecord(valor)) return estadoVazio()
  const projeto = isRecord(valor.projeto) ? valor.projeto : {}
  const circuitos = Array.isArray(projeto.circuitos)
    ? projeto.circuitos
        .map(sanitizarCircuito)
        .filter((circuito): circuito is Circuit => circuito !== null)
    : []

  return {
    versao: STATE_VERSION,
    projeto: {
      nome: texto(projeto.nome).slice(0, 80),
      cliente: texto(projeto.cliente).slice(0, 80),
      modelo: texto(projeto.modelo, 'custom'),
      circuitos,
    },
    ajustes: sanitizarAjustes(valor.ajustes),
  }
}

export function carregarEstado(): Estado | null {
  try {
    const cru = localStorage.getItem(STORAGE_KEY)
    if (!cru) return null
    return sanitizarEstado(JSON.parse(cru))
  } catch {
    return null
  }
}

export function salvarEstado(estado: Estado): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado))
  } catch {
    /* cota cheia ou modo privado: o app continua funcionando em memória */
  }
}

export function limparEstado(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* sem ação */
  }
}
