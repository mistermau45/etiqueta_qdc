import { useState } from 'react'
import { baixarPdf, baixarTexto, lerArquivo, nomeDoArquivo } from '../lib/download'
import { A4, ETIQUETA, MARGEM_PADRAO } from '../lib/pdf/layout'
import { sanitizarEstado } from '../lib/storage'
import type { Acao } from '../lib/store'
import type { Estado, MargemId } from '../lib/types'
import { MODELOS, getModelo } from '../lib/panelModels'
import Icone from './Icone'
import type { Aviso as AvisoType } from './Aviso'

interface Props {
  estado: Estado
  despachar: (acao: Acao) => void
  avisar: (aviso: AvisoType) => void
}

const MARGENS: { id: MargemId; rotulo: string }[] = [
  { id: 'sem-margem', rotulo: 'Sem margem' },
  { id: '5mm', rotulo: '5 mm' },
  { id: '10mm', rotulo: '10 mm' },
]

export default function Exportar({ estado, despachar, avisar }: Props) {
  const [gerando, setGerando] = useState(false)

  const { circuitos } = estado.projeto
  const modelo = getModelo(estado.projeto.modelo)
  const margem = MARGEM_PADRAO[estado.ajustes.opcoes.margem] ?? 0
  const colunas = Math.max(1, Math.floor((A4.largura - margem * 2) / ETIQUETA.largura))
  const linhas = Math.max(1, Math.floor((A4.altura - margem * 2 - 22) / ETIQUETA.altura))
  const paginas = circuitos.length > 0 ? Math.ceil(circuitos.length / (colunas * linhas)) : 0
  const paginasTotal = paginas + (estado.ajustes.opcoes.mostrarTabela && circuitos.length > 0 ? 1 : 0)

  async function gerar() {
    if (circuitos.length === 0) return
    setGerando(true)
    try {
      const { gerarPdf } = await import('../lib/pdf/generatePdf')
      const dados = await gerarPdf(estado)
      baixarPdf(dados, nomeDoArquivo(estado.projeto.nome))
      avisar({ texto: 'PDF gerado. Abra e imprima em tamanho real.' })
    } catch {
      avisar({ texto: 'Não consegui gerar o PDF. Tente novamente.', erro: true })
    } finally {
      setGerando(false)
    }
  }

  function exportarBackup() {
    baixarTexto(
      JSON.stringify({ ...estado, exportadoEm: new Date().toISOString() }, null, 2),
      nomeDoArquivo(estado.projeto.nome, 'json'),
    )
    avisar({ texto: 'Backup salvo no seu dispositivo.' })
  }

  async function importarBackup(arquivo: File) {
    try {
      const bruto = await lerArquivo(arquivo)
      const estado = sanitizarEstado(JSON.parse(bruto))
      if (estado.projeto.circuitos.length === 0) {
        avisar({ texto: 'Esse arquivo não tem circuitos salvos.', erro: true })
        return
      }
      despachar({ tipo: 'substituirTudo', estado })
      avisar({ texto: `${estado.projeto.circuitos.length} circuitos restaurados.` })
    } catch {
      avisar({ texto: 'Arquivo inválido. Use o backup gerado por este app.', erro: true })
    }
  }

  return (
    <div className="grade-duas">
      <div className="cartao">
        <h2>
          <Icone nome="print" />
          Seu PDF
        </h2>
        <p className="dica">
          Etiquetas na medida exata de 17,5 × 12 mm e a tabela de identificação, no mesmo arquivo.
        </p>

        <dl className="resumo">
          <div>
            <dt>Circuitos</dt>
            <dd>{circuitos.length}</dd>
          </div>
          <div>
            <dt>Folhas de etiqueta</dt>
            <dd>{paginas}</dd>
          </div>
          <div>
            <dt>Páginas no total</dt>
            <dd>{paginasTotal}</dd>
          </div>
          <div>
            <dt>Modelo do quadro</dt>
            <dd>
              {modelo.marca} · {modelo.nome}
            </dd>
          </div>
        </dl>

        <div className="caixa" style={{ marginBottom: 16 }}>
          <p className="caixa-titulo">Como imprimir</p>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
            Escolha <b>A4</b> e <b>tamanho real (100%)</b>. Papel adesivo A4 fica melhor; em papel comum, corte
            rente e passe fita transparente por cima. Não reduza a escala — a etiqueta é medida em milímetros.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primario btn-bloco"
          onClick={gerar}
          disabled={circuitos.length === 0 || gerando}
        >
          <Icone nome="download" />
          {gerando ? 'Gerando…' : 'Baixar PDF'}
        </button>

        {circuitos.length === 0 && (
          <p className="aviso" style={{ textAlign: 'center' }}>
            Cadastre pelo menos um circuito para gerar o PDF.
          </p>
        )}
      </div>

      <div className="cartao">
        <h2>
          <Icone nome="sparkles" />
          Ajustes do arquivo
        </h2>
        <p className="dica">Escolha o que entra no PDF e como as etiquetas são posicionadas na folha.</p>

        <div className="caixa" style={{ marginBottom: 16 }}>
          <p className="caixa-titulo">Conteúdo</p>
          <label className="opcao">
            <input
              type="checkbox"
              checked={estado.ajustes.opcoes.mostrarTabela}
              onChange={(evento) =>
                despachar({ tipo: 'definirOpcao', opcao: 'mostrarTabela', valor: evento.target.checked })
              }
            />
            <span>
              Incluir tabela de identificação
              <small>Uma página extra com todos os circuitos em formato de tabela.</small>
            </span>
          </label>
        </div>

        <div className="caixa" style={{ marginBottom: 16 }}>
          <p className="caixa-titulo">Margem da impressora</p>
          <div className="segmentado" role="group" aria-label="Margem da impressora">
            {MARGENS.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                aria-pressed={estado.ajustes.opcoes.margem === opcao.id}
                onClick={() => despachar({ tipo: 'definirOpcao', opcao: 'margem', valor: opcao.id })}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '9px 0 0', lineHeight: 1.5 }}>
            {margem === 0
              ? `Cabeçalho em 12 colunas × ${linhas} linhas = ${colunas * linhas} etiquetas por folha. Use se sua impressora imprime até a borda.`
              : `A etiqueta encolhe para ${Math.floor((A4.largura - margem * 2) / ETIQUETA.largura)} colunas × ${linhas} linhas. Use se as bordas saírem cortadas.`}
          </p>
        </div>

        <div className="barra-acoes">
          <button type="button" className="btn btn-neutro" onClick={exportarBackup}>
            <Icone nome="download" />
            Salvar backup
          </button>

          <label className="btn btn-neutro" style={{ cursor: 'pointer' }}>
            <Icone nome="upload" />
            Abrir backup
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(evento) => {
                const arquivo = evento.target.files?.[0]
                if (arquivo) void importarBackup(arquivo)
                evento.target.value = ''
              }}
            />
          </label>
        </div>

        <p className="aviso">
          Tudo fica salvo <b>só neste dispositivo</b>. Limpar os dados do navegador apaga o projeto —{' '}
          <b>Salvar backup</b> antes. São {MODELOS.length} modelos de quadro e {circuitos.length} circuitos neste
          arquivo.
        </p>
      </div>
    </div>
  )
}
