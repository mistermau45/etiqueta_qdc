import { uid } from './id'
import type { Circuit, CircuitTypeId } from './types'
import { CIRCUIT_TYPES } from './circuitTypes'

const PALAVRAS_TIPO: Record<string, CircuitTypeId> = (() => {
  const map: Record<string, CircuitTypeId> = {}
  for (const type of CIRCUIT_TYPES) map[type.id] = type.id

  const extras: Record<string, CircuitTypeId> = {
    geral: 'geral',
    g: 'geral',
    total: 'geral',
    dr: 'dr',
    idr: 'dr',
    diferencial: 'dr',
    residual: 'dr',
    dps: 'dps',
    spd: 'dps',
    surto: 'dps',
    protetor: 'dps',
    clamp: 'dps',
    iluminacao: 'iluminacao',
    ilumina: 'iluminacao',
    luz: 'iluminacao',
    lamp: 'iluminacao',
    tomada: 'tomadas',
    tomadas: 'tomadas',
    tom: 'tomadas',
    specials: 'tomada-especial',
    especial: 'tomada-especial',
    cook: 'cooktop',
    cooktop: 'cooktop',
    fogao: 'cooktop',
    oven: 'forno',
    forno: 'forno',
    chuv: 'chuveiro',
    chuveiro: 'chuveiro',
    shower: 'chuveiro',
    ar: 'ar-condicionado',
    arcondicionado: 'ar-condicionado',
    'ar-condicionado': 'ar-condicionado',
    ac: 'ar-condicionado',
    exaustor: 'tiragem',
    tiragem: 'tiragem',
    duto: 'tiragem',
    bomba: 'bomba',
    mot: 'motores',
    motor: 'motores',
    portao: 'motores',
    outros: 'outros',
    outro: 'outros',
  }
  for (const [key, value] of Object.entries(extras)) map[key] = value
  return map
})()

const CHAVE_AMPERAGEM = /^(\d{1,3}(?:[.,]\d)?)\s*(a|amp|amps|ma)$/i

/** Junta `40` `A` (ou `10` `amp`, `30` `ma`) em um único token `40 A`. */
function mesclarAmperagemTokens(tokens: string[]): string[] {
  const resultado: string[] = []
  let indice = 0
  while (indice < tokens.length) {
    const atual = tokens[indice] ?? ''
    const proximo = tokens[indice + 1] ?? ''
    if (/^\d{1,3}(?:[.,]\d)?$/.test(atual) && /^(a|amp|amps|ma)$/i.test(proximo)) {
      resultado.push(`${atual} ${proximo}`)
      indice += 2
    } else {
      resultado.push(atual)
      indice += 1
    }
  }
  return resultado
}

function normalizar(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function acharTipo(token: string): CircuitTypeId | null {
  const limpo = normalizar(token).replace(/[^a-z-]/g, '')
  if (!limpo) return null
  return PALAVRAS_TIPO[limpo] ?? null
}

function acharAmperagem(token: string): string | null {
  const match = CHAVE_AMPERAGEM.exec(token)
  if (!match) return null
  return `${match[1].replace(',', '.')} A`
}

function limparNumero(valor: string): string {
  return valor.replace(/^[\s.:;,-]+|[\s.,;-]+$/g, '').trim()
}

/**
 * Interpreta uma linha livre no formato `numero | tipo | ambiente | amperagem`.
 * Tudo após o número é opcional, então `3` e `3 tomada cozinha 20a` funcionam.
 * A amperagem é reconhecida em qualquer posição do restante da linha.
 */
export function parseLinha(entrada: string): Circuit | null {
  const linha = entrada.replace(/[\t;]+/g, '|').trim()
  if (!linha) return null

  const campos = linha.split('|').map((campo) => campo.trim())
  const primeiroCampo = campos[0] ?? ''
  const numero = limparNumero(primeiroCampo.split(/\s+/)[0] ?? '')

  const tokens = mesclarAmperagemTokens(
    [
      ...primeiroCampo.split(/\s+/).slice(1),
      ...campos.slice(1).flatMap((campo) => campo.split(/\s+/)),
    ].filter(Boolean),
  )

  if (!numero && tokens.length === 0) return null

  let tipo: CircuitTypeId | null = null
  const ambienteTokens: string[] = []
  let amperagem = ''

  for (const token of tokens) {
    if (!amperagem) {
      const achada = acharAmperagem(token)
      if (achada) {
        amperagem = achada
        continue
      }
    }
    if (!tipo) {
      const encontrado = acharTipo(token)
      if (encontrado) {
        tipo = encontrado
        continue
      }
    }
    ambienteTokens.push(token)
  }

  return {
    id: uid(),
    numero: numero || '?',
    tipo: tipo ?? 'outros',
    ambiente: ambienteTokens.join(' ').replace(/\s+/g, ' ').trim(),
    amperagem,
  }
}

export function parseLista(entrada: string): Circuit[] {
  const linhas = entrada
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)

  const circuitos: Circuit[] = []
  for (const linha of linhas) {
    const circuito = parseLinha(linha)
    if (circuito) circuitos.push(circuito)
  }

  return circuitos
}
