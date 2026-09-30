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

function desenharEtiqueta(page: PDFPage, circuito: Circuit, xMm: number, yMm: number, fontes: Fonte) {
  const tipo = getCircuitType(circuito.tipo)
  const x = paraPt(xMm)
  const y = paraPt(yMm)
  const largura = paraPt(ETIQUETA.largura)
  const altura = paraPt(ETIQUETA.altura)
  const centroX = x + largura / 2
  const margemInterna = 1.1

  page.drawRectangle({ x, y, width: largura, height: altura, color: BRANCO })

  const alturaBarra = altura * 0.2
  page.drawRectangle({
    x,
    y: y + altura - alturaBarra,
    width: largura,
    height: alturaBarra,
    color: cor(tipo.color),
  })

  const numero = ajustarTexto(
    circuito.numero,
    fontes.negrito,
    alturaBarra * 0.6,
    largura - paraPt(margemInterna) * 2,
    1,
    3,
  )
  centralizar(page, fontes.negrito, numero.texto, centroX, y + altura - alturaBarra / 2, numero.tamanho, corDeTexto(tipo.color))

  const util = altura - alturaBarra
  const centroIcone = y + altura - alturaBarra - util * 0.155
  desenharIconeCentro(page, tipo.icon, centroX, centroIcone, 2.7, TINTA_COR)

  const alturaNome = util * 0.23
  const centroNome = y + altura - alturaBarra - util * 0.31 - alturaNome / 2
  const nome = ajustarTexto(
    tipo.label,
    fontes.negrito,
    alturaNome * 0.62,
    largura - paraPt(margemInterna) * 2,
    1,
    3.4,
  )
  centralizar(page, fontes.negrito, nome.texto, centroX, centroNome, nome.tamanho, TINTA_COR)

  const alturaRodape = util * 0.26
  const rodape =
    [circuito.ambiente, circuito.amperagem].filter(Boolean).join(' ') ||
    (circuito.tipo === 'geral' ? 'Disjuntor geral' : 'Circuito')
  const detalhe = ajustarTexto(
    rodape,
    fontes.normal,
    (alturaRodape / 1.25) * 0.9,
    largura - paraPt(margemInterna) * 2,
    2,
    3,
  )
  const linhas = detalhe.texto ? detalhe.texto.split('\n') : []
  const tamanho = Math.min(detalhe.tamanho, alturaRodape / (linhas.length * 1.22))
  const blocoAltura = tamanho * linhas.length * 1.05
  let cursorY = y + alturaRodape * 0.42 + blocoAltura / 2 - tamanho * 0.72
  for (const linha of linhas) {
    centralizar(page, fontes.normal, linha, centroX, cursorY, tamanho, SUAVE_COR)
    cursorY -= tamanho * 1.05
  }

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

const TAMANHO_CELULA = 10
const INTERVALO_LINHA = 12

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

const ALTURA_LINHA = 11.5

function desenharTabela(doc: PDFDocument, estado: Estado, fontes: Fonte) {
  const { circuitos } = estado.projeto
  const larguraTotal = COLUNAS_TABELA.reduce((soma, coluna) => soma + coluna.largura, 0)
  const offsets: number[] = []
  let acumulado = X0
  for (const coluna of COLUNAS_TABELA) {
    offsets.push(acumulado)
    acumulado += coluna.largura
  }

  const avançaLinha = paraPt(ALTURA_LINHA)

  let pagina = 0
  let atual = novaPagina(doc, estado, fontes, 'Tabela de identificação')
  pagina += 1

  const cabecalho = () => {
    const y = atual.cursor
    const alturaRect = paraPt(ALTURA_LINHA - 1)
    atual.page.drawRectangle({
      x: paraPt(X0),
      y: y - 3.5,
      width: paraPt(larguraTotal),
      height: alturaRect,
      color: cor('#f1f2f5'),
    })
    COLUNAS_TABELA.forEach((coluna, indice) => {
      atual.page.drawText(coluna.titulo, {
        x: paraPt(offsets[indice]) + 2,
        y: y - 3.5 + alturaRect / 2 - 8.5 * 0.35,
        size: 8.5,
        font: fontes.negrito,
        color: TINTA_COR,
      })
    })
    atual.cursor = y - avançaLinha
  }

  cabecalho()

  circuitos.forEach((circuito) => {
    if (atual.cursor - avançaLinha < paraPt(16)) {
      atual = novaPagina(doc, estado, fontes, `Tabela de identificação · ${pagina + 1}`)
      pagina += 1
      cabecalho()
    }

    const tipo = getCircuitType(circuito.tipo)
    const y = atual.cursor - 1.4

    atual.page.drawRectangle({
      x: paraPt(offsets[0]) + 2.5,
      y: y - 1,
      width: paraPt(1.5),
      height: paraPt(ALTURA_LINHA - 4.5),
      color: cor(tipo.color),
    })

    const descricao =
      circuito.tipo === 'geral'
        ? `Alimentação geral${circuito.amperagem ? ` ${circuito.amperagem}` : ''}`
        : `${tipo.label}${circuito.amperagem ? ` ${circuito.amperagem}` : ''}`

    const valores = [circuito.numero, tipo.label, circuito.ambiente, descricao, circuito.amperagem]

    const meioFaixa = atual.cursor - avançaLinha / 2
    const topoFaixa = meioFaixa + avançaLinha / 2

    COLUNAS_TABELA.forEach((coluna, indice) => {
      const valor = valores[indice]?.trim()
      if (!valor) return
      const fonte = indice === 0 ? fontes.negrito : fontes.normal
      const linhas = quebrarLinhas(valor, fonte, TAMANHO_CELULA, paraPt(coluna.largura - 4))
      const topoTexto = topoFaixa - (linhas.length * INTERVALO_LINHA) / 2
      let yLinha = topoTexto + TAMANHO_CELULA * 0.72
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
      start: { x: paraPt(X0), y: atual.cursor - avançaLinha },
      end: { x: paraPt(X0 + larguraTotal), y: atual.cursor - avançaLinha },
      thickness: 0.4,
      color: BORDA_COR,
    })

    atual.cursor -= avançaLinha
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
