import { rgb, type RGB } from 'pdf-lib'
import type { MargemId } from '../types'

export const MM = 72 / 25.4

export const A4 = { largura: 210, altura: 297 }
export const MARGEM_PADRAO: Record<MargemId, number> = {
  'sem-margem': 0,
  '5mm': 5,
  '10mm': 10,
}

export const ETIQUETA = { largura: 17.5, altura: 30, raio: 1.2 }

export function paraPt(mm: number): number {
  return mm * MM
}

export function hexParaRgb01(hex: string): { r: number; g: number; b: number } {
  const limpo = hex.replace('#', '').trim()
  const completo =
    limpo.length === 3
      ? limpo
          .split('')
          .map((c) => c + c)
          .join('')
      : limpo.padEnd(6, '0').slice(0, 6)

  return {
    r: Number.parseInt(completo.slice(0, 2), 16) / 255,
    g: Number.parseInt(completo.slice(2, 4), 16) / 255,
    b: Number.parseInt(completo.slice(4, 6), 16) / 255,
  }
}

/** Converte "#rrggbb" em um RGB do pdf-lib. */
export function cor(hex: string): RGB {
  const { r, g, b } = hexParaRgb01(hex)
  return rgb(r, g, b)
}

export function luminancia(hex: string): number {
  const { r, g, b } = hexParaRgb01(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Escolhe preto ou branco para contraste sobre a cor do circuito. */
export function corDeTexto(hex: string): RGB {
  return luminancia(hex) > 0.58 ? cor('#151823') : rgb(1, 1, 1)
}

interface Medidor {
  widthOfTextAtSize(texto: string, tamanho: number): number
}

/**
 * Reduz o corpo da fonte até o texto caber em `maxLinhas` linhas de
 * `larguraMax`, acrescentando reticências no final quando sobra conteúdo.
 */
export function ajustarTexto(
  texto: string,
  fonte: Medidor,
  tamanho: number,
  larguraMax: number,
  maxLinhas: number,
  tamanhoMinimo = 4,
): { texto: string; tamanho: number } {
  const original = texto.trim()
  if (!original) return { texto: '', tamanho }

  let corpo = tamanho
  for (;;) {
    const linhas = quebrar(original, fonte, corpo, larguraMax)
    if (linhas.length <= maxLinhas || corpo <= tamanhoMinimo) {
      if (linhas.length <= maxLinhas) return { texto: linhas.join('\n'), tamanho: corpo }
      const mantidas = linhas.slice(0, maxLinhas)
      mantidas[maxLinhas - 1] = `${mantidas[maxLinhas - 1].replace(/\s+\S*$/, '')}…`
      return { texto: mantidas.join('\n'), tamanho: corpo }
    }
    corpo = Number((corpo - 0.25).toFixed(2))
  }
}

function quebrar(texto: string, fonte: Medidor, tamanho: number, larguraMax: number): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean)
  const linhas: string[] = []
  let atual = ''

  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra
    if (fonte.widthOfTextAtSize(tentativa, tamanho) <= larguraMax) {
      atual = tentativa
      continue
    }

    if (atual) {
      linhas.push(atual)
      atual = ''
    }

    let resto = palavra
    while (resto.length > 1 && fonte.widthOfTextAtSize(resto, tamanho) > larguraMax) {
      let corte = resto.length - 1
      while (corte > 1 && fonte.widthOfTextAtSize(`${resto.slice(0, corte)}-`, tamanho) > larguraMax) {
        corte -= 1
      }
      linhas.push(`${resto.slice(0, corte)}-`)
      resto = resto.slice(corte)
    }
    atual = resto
  }
  if (atual) linhas.push(atual)
  return linhas
}

/** Quebra por contagem de caracteres, usada onde não há fonte carregada. */
export function quebrarPorCaracteres(texto: string, maxCaracteres: number, maxLinhas: number): string[] {
  return quebrar(texto, { widthOfTextAtSize: (t) => t.length * 1 }, maxCaracteres, maxCaracteres * maxLinhas)
}

export { quebrar as quebrarPorLargura }

