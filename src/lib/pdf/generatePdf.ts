import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { getCircuitType } from '../circuitTypes'
import { getModelo } from '../panelModels'
import type { Circuit, Estado } from '../types'
import { desenharIconeCentro } from './glyphs'
import {
  A4,
  ajustarTexto,
  cor,
  corDeTexto,
  ETIQUETA,
  MARGEM_PADRAO,
  paraPt,
} from './layout'

const TINTA = '#151823'
const SUAVE = '#5b6271'
const BORDA = '#d5d8dc'
const ROXO = '#7350e5'

const BRANCO = rgb(1, 1, 1)
const TINTA_COR = cor(TINTA)
const SUAVE_COR = cor(SUAVE)
const BORDA_COR = cor(BORDA)
const ROXO_COR = cor(ROXO)

const X0 = 10
const X1 = A4.largura - 10
const TOPO = 10

interface Fonte {
  normal: PDFFont
  negrito: PDFFont
}

interface Grade {
  colunas: number
  linhas: number
  margem: number
  porPagina: number
}

function calcularGrade(margem: number): Grade {
  const larguraUtil = A4.largura - margem * 2
  const alturaUtil = A4.altura - margem * 2 - TOPO - 12
  const colunas = Math.max(1, Math.floor(larguraUtil / ETIQUETA.largura))
  const linhas = Math.max(1, Math.floor(alturaUtil / ETIQUETA.altura))
  return { colunas, linhas, margem, porPagina: colunas * linhas }
}

function centralizar(
  page: PDFPage,
  fonte: PDFFont,
  conteudo: string,
  cx: number,
  cy: number,
  tamanho: number,
  tinta: ReturnType<typeof cor>,
) {
  if (!conteudo) return
  const largura = fonte.widthOfTextAtSize(conteudo, tamanho)
  page.drawText(conteudo, {
    x: cx - largura / 2,
    y: cy - tamanho * 0.35,
    size: tamanho,
    font: fonte,
    color: tinta,
  })
}

function desenharBlocoCentralizado(
  page: PDFPage,
  fonte: PDFFont,
  texto: string,
  cx: number,
  centroY: number,
  tamanho: number,
  larguraMax: number,
  maxLinhas: number,
  tinta: ReturnType<typeof cor>,
) {
  if (!texto.trim()) return
  const ajustado = ajustarTexto(texto, fonte, tamanho, larguraMax, maxLinhas, 3)
  const linhas = ajustado.texto ? ajustado.texto.split('\n') : []
  const espaco = ajustado.tamanho * 1.08
  const blocoAltura = espaco * linhas.length
  let yLinha = centroY + blocoAltura / 2 - ajustado.tamanho * 0.35
  for (const linha of linhas) {
    centralizar(page, fonte, linha, cx, yLinha, ajustado.tamanho, tinta)
    yLinha -= espaco
  }
}

function desenharEtiqueta(page: PDFPage, circuito: Circuit, xMm: number, yMm: number, fontes: Fonte) {
  const tipo = getCircuitType(circuito.tipo)
  const x = paraPt(xMm)
  const y = paraPt(yMm)
  const largura = paraPt(ETIQUETA.largura)
  const altura = paraPt(ETIQUETA.altura)
  const centroX = x + largura / 2
  const margemInterna = paraPt(1.2)

  page.drawRectangle({ x, y, width: largura, height: altura, color: BRANCO })

  const barra = paraPt(7.5)
  page.drawRectangle({
    x,
    y: y + altura - barra,
    width: largura,
    height: barra,
    color: cor(tipo.color),
  })

  const numero = ajustarTexto(
    circuito.numero,
    fontes.negrito,
    11,
    largura - margemInterna * 2,
    1,
    3,
  )
  centralizar(page, fontes.negrito, numero.texto, centroX, y + altura - barra / 2, numero.tamanho, corDeTexto(tipo.color))

  const util = altura - barra

  desenharIconeCentro(page, tipo.icon, centroX, y + util - paraPt(3.2), 3.4, TINTA_COR)

  desenharBlocoCentralizado(
    page,
    fontes.negrito,
    tipo.label,
    centroX,
    y + util - paraPt(10.2),
    9.5,
    largura - margemInterna * 2,
    2,
    TINTA_COR,
  )

  const rodape =
    [circuito.ambiente, circuito.amperagem].filter(Boolean).join(' ') ||
    (circuito.tipo === 'geral' ? 'Disjuntor geral' : 'Circuito')
  desenharBlocoCentralizado(
    page,
    fontes.normal,
    rodape,
    centroX,
    y + util - paraPt(18.4),
    8,
    largura - margemInterna * 2,
    2,
    SUAVE_COR,
  )

  page.drawRectangle({
    x,
    y,
    width: largura,
    height: altura,
    borderColor: BORDA_COR,
    borderWidth: 0.4,
  })
}

function desenharCabecalho(page: PDFPage, estado: Estado, fontes: Fonte, rotulo: string): number {
  const larguraRotulo = fontes.normal.widthOfTextAtSize(rotulo, 7.5)
  page.drawText('QUADRO IDENTIFICADO', {
    x: paraPt(X0),
    y: paraPt(A4.altura - TOPO) - 7.5,
    size: 7.5,
    font: fontes.negrito,
    color: ROXO_COR,
  })
  page.drawText(rotulo, {
    x: paraPt(X1) - larguraRotulo,
    y: paraPt(A4.altura - TOPO) - 7.5,
    size: 7.5,
    font: fontes.normal,
    color: SUAVE_COR,
  })

  const nome = estado.projeto.nome.trim() || 'Quadro sem nome'
  page.drawText(nome, {
    x: paraPt(X0),
    y: paraPt(A4.altura - TOPO) - 7.5 - 11,
    size: 13,
    font: fontes.negrito,
    color: TINTA_COR,
  })

  const modelo = getModelo(estado.projeto.modelo)
  const cliente = estado.projeto.cliente.trim()
  const detalhe = [cliente, `${modelo.marca} · ${modelo.nome}`].filter(Boolean).join('   ·   ')
  if (detalhe) {
    page.drawText(detalhe, {
      x: paraPt(X0),
      y: paraPt(A4.altura - TOPO) - 7.5 - 11 - 9,
      size: 8,
      font: fontes.normal,
      color: SUAVE_COR,
    })
  }

  return paraPt(A4.altura - TOPO) - 7.5 - 11 - (detalhe ? 9 : 0) - 8
}

function novaPagina(doc: PDFDocument, estado: Estado, fontes: Fonte, rotulo: string) {
  const page = doc.addPage([paraPt(A4.largura), paraPt(A4.altura)])
  const cursor = desenharCabecalho(page, estado, fontes, rotulo)
  return { page, cursor }
}

const COLUNAS_TABELA = [
  { titulo: 'Circ.', largura: 16 },
  { titulo: 'Tipo', largura: 34 },
  { titulo: 'Ambiente / local', largura: 62 },
  { titulo: 'Descrição', largura: 58 },
  { titulo: 'Corrente', largura: 26 },
]

const TAMANHO_CELULA = 7.5
const INTERVALO_LINHA = 9
const MAX_LINHAS_CELULA = 2

function quebrarLinhas(texto: string, fonte: PDFFont, tamanho: number, larguraMax: number): string[] {
  const palavras = texto.split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return []
  const linhas: string[] = []
  let atual = palavras[0]!
  for (const palavra of palavras.slice(1)) {
    const candidato = `${atual} ${palavra}`
    if (fonte.widthOfTextAtSize(candidato, tamanho) <= larguraMax) {
      atual = candidato
    } else {
      linhas.push(atual)
      atual = palavra
    }
  }
  linhas.push(atual)
  return linhas
}

function limitarLinhas(linhas: string[], maximo: number): string[] {
  if (linhas.length <= maximo) return linhas
  const mantidas = linhas.slice(0, maximo)
  mantidas[maximo - 1] = `${mantidas[maximo - 1].replace(/\s+\S*$/, '')}…`
  return mantidas
}

const ALTURA_LINHA = 7.5

function desenharTabela(doc: PDFDocument, estado: Estado, fontes: Fonte) {
  const { circuitos } = estado.projeto
  const larguraTotal = COLUNAS_TABELA.reduce((soma, coluna) => soma + coluna.largura, 0)
  const offsets: number[] = []
  let acumulado = X0
  for (const coluna of COLUNAS_TABELA) {
    offsets.push(acumulado)
    acumulado += coluna.largura
  }

  const avanca = paraPt(ALTURA_LINHA)
  const recuoFaixa = 1.2

  let pagina = 0
  let atual = novaPagina(doc, estado, fontes, 'Tabela de identificação')
  pagina += 1

  const cabecalho = () => {
    const topo = atual.cursor
    const base = topo - avanca
    const alturaFaixa = avanca - recuoFaixa
    atual.page.drawRectangle({
      x: paraPt(X0),
      y: base,
      width: paraPt(larguraTotal),
      height: alturaFaixa,
      color: cor('#f1f2f5'),
    })
    const centro = base + alturaFaixa / 2 - 7 * 0.35
    COLUNAS_TABELA.forEach((coluna, indice) => {
      atual.page.drawText(coluna.titulo, {
        x: paraPt(offsets[indice]) + 2,
        y: centro,
        size: 7,
        font: fontes.negrito,
        color: TINTA_COR,
      })
    })
    atual.cursor = base
  }

  cabecalho()

  circuitos.forEach((circuito) => {
    if (atual.cursor - avanca < paraPt(11)) {
      atual = novaPagina(doc, estado, fontes, `Tabela de identificação · ${pagina + 1}`)
      pagina += 1
      cabecalho()
    }

    const tipo = getCircuitType(circuito.tipo)
    const topo = atual.cursor
    const base = topo - avanca

    const alturaAba = paraPt(ALTURA_LINHA - 3)
    atual.page.drawRectangle({
      x: paraPt(offsets[0]) + 2.5,
      y: base + (avanca - alturaAba) / 2,
      width: paraPt(1.5),
      height: alturaAba,
      color: cor(tipo.color),
    })

    const descricao =
      circuito.tipo === 'geral'
        ? `Alimentação geral${circuito.amperagem ? ` ${circuito.amperagem}` : ''}`
        : `${tipo.label}${circuito.amperagem ? ` ${circuito.amperagem}` : ''}`

    const valores = [circuito.numero, tipo.label, circuito.ambiente, descricao, circuito.amperagem]
    const meio = (topo + base) / 2

    COLUNAS_TABELA.forEach((coluna, indice) => {
      const valor = valores[indice]?.trim()
      if (!valor) return
      const fonte = indice === 0 ? fontes.negrito : fontes.normal
      const linhas = limitarLinhas(
        quebrarLinhas(valor, fonte, TAMANHO_CELULA, paraPt(coluna.largura - 4)),
        MAX_LINHAS_CELULA,
      )
      const bloco = INTERVALO_LINHA * linhas.length
      let yLinha = meio + bloco / 2 - TAMANHO_CELULA * 0.35
      for (const linha of linhas) {
        atual.page.drawText(linha, {
          x: paraPt(offsets[indice]) + (indice === 0 ? 6 : 2),
          y: yLinha,
          size: TAMANHO_CELULA,
          font: fonte,
          color: indice === 0 ? TINTA_COR : SUAVE_COR,
        })
        yLinha -= INTERVALO_LINHA
      }
    })

    atual.page.drawLine({
      start: { x: paraPt(X0), y: base },
      end: { x: paraPt(X0 + larguraTotal), y: base },
      thickness: 0.4,
      color: BORDA_COR,
    })

    atual.cursor = base
  })
}

export async function gerarPdf(estado: Estado): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const fontes: Fonte = {
    normal: await doc.embedFont(StandardFonts.Helvetica),
    negrito: await doc.embedFont(StandardFonts.HelveticaBold),
  }

  const { circuitos } = estado.projeto

  if (circuitos.length > 0) {
    const margem = MARGEM_PADRAO[estado.ajustes.opcoes.margem] ?? 0
    const grade = calcularGrade(margem)
    const totalPaginas = Math.ceil(circuitos.length / grade.porPagina)

    for (let indice = 0; indice < totalPaginas; indice += 1) {
      const { page, cursor } = novaPagina(
        doc,
        estado,
        fontes,
        `Etiquetas · ${indice + 1}/${totalPaginas}`,
      )
      const fatia = circuitos.slice(indice * grade.porPagina, (indice + 1) * grade.porPagina)
      const topoDaGrade = cursor / paraPt(1) - ETIQUETA.altura

      fatia.forEach((circuito, posicao) => {
        const coluna = posicao % grade.colunas
        const linha = Math.floor(posicao / grade.colunas)
        desenharEtiqueta(
          page,
          circuito,
          margem + coluna * ETIQUETA.largura,
          topoDaGrade - linha * ETIQUETA.altura,
          fontes,
        )
      })
    }

    if (estado.ajustes.opcoes.mostrarTabela) desenharTabela(doc, estado, fontes)
  } else {
    novaPagina(doc, estado, fontes, 'Etiquetas')
  }

  doc.setTitle(estado.projeto.nome.trim() || 'Quadro identificado')
  doc.setCreator('Quadro Identificado')
  doc.setProducer('Quadro Identificado')
  return doc.save()
}
