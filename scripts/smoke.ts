import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { gerarPdf } from '../src/lib/pdf/generatePdf'
import { criarProjetoExemplo } from '../src/lib/sample'
import { parseLista } from '../src/lib/parser'
import { sanitizarEstado } from '../src/lib/storage'

const erros: string[] = []

function ok(condicao: boolean, nome: string) {
  if (condicao) {
    console.log(`  ok  ${nome}`)
  } else {
    erros.push(nome)
    console.error(`FALHOU ${nome}`)
  }
}

const saida = join(process.cwd(), '.cache')
mkdirSync(saida, { recursive: true })
if (process.env.SMOKE_DEBUG) console.log('smoke:', saida)

// 1. Estado do exemplo (caso real da landing page)
const exemplo = criarProjetoExemplo()
const pdf1 = await gerarPdf(exemplo)
writeFileSync(`${saida}/exemplo.pdf`, pdf1)
ok(pdf1 instanceof Uint8Array && pdf1.length > 1000, `exemplo.pdf gerado (${pdf1.length} bytes)`)
ok(new TextDecoder().decode(pdf1.slice(0, 5)) === '%PDF-', 'cabeçalho %PDF')

// 2. Quadro grande que estoura uma folha
const grande = parseLista(
  Array.from({ length: 70 }, (_, indice) => `${indice + 1} | tomadas | Sala ${indice + 1} | 10 A`).join('\n'),
)
const estadoGrande = sanitizarEstado({
  versao: 1,
  projeto: { nome: 'Quadro 70', cliente: '', modelo: 'weg-60', circuitos: grande },
  ajustes: { nome: '', cliente: '', modelo: 'weg-60', opcoes: { mostrarTabela: true, margem: '5mm' } },
})
const pdf2 = await gerarPdf(estadoGrande)
writeFileSync(`${saida}/grande.pdf`, pdf2)
ok(pdf2.length > pdf1.length, 'múltiplas folhas (70 circuitos) maior que exemplo')

// 3. Sem circuitos
const vazio = sanitizarEstado({
  versao: 1,
  projeto: { nome: '', cliente: '', modelo: 'custom', circuitos: [] },
  ajustes: undefined,
})
const pdf3 = await gerarPdf(vazio)
writeFileSync(`${saida}/vazio.pdf`, pdf3)
ok(pdf3.length > 500, 'estado vazio ainda gera página')

// 4. Tipos com acento/amperagem no parser
const bruto = parseLista('1 iluminação sala 10A\n2 tomada cozinha 20A\nGERAL geral 63A\n')
ok(bruto.length === 3, 'parser: 3 linhas')
ok(bruto[0]?.tipo === 'iluminacao' && bruto[0]?.ambiente === 'sala' && bruto[0]?.amperagem === '10 A', 'parser: linha 1')
ok(bruto[2]?.tipo === 'geral' && bruto[2]?.numero === 'GERAL', 'parser: geral')

// 5. Proteção: DR e DPS reconhecidos no parser
const proteçao = parseLista('DPS | dps | Entrada\nDR | dr | Diferencial geral | 40 A\n1 | diferencial | banheiro\n')
ok(proteçao.length === 3, 'parser: 3 linhas de proteção')
ok(proteçao[0]?.tipo === 'dps' && proteçao[0]?.ambiente === 'Entrada', 'parser: dps')
ok(proteçao[1]?.tipo === 'dr' && proteçao[1]?.amperagem === '40 A', 'parser: dr com amperagem "40 A"')
ok(proteçao[2]?.tipo === 'dr' && proteçao[2]?.ambiente === 'banheiro', 'parser: diferencial vira dr')

process.exit(erros.length === 0 ? 0 : 1)