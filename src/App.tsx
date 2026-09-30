import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import Aviso, { type Aviso as AvisoType } from './components/Aviso'
import Exportar from './components/Exportar'
import Icone from './components/Icone'
import ListaCircuitos from './components/ListaCircuitos'
import Previa from './components/Previa'
import SeletorQuadro from './components/SeletorQuadro'
import { MODELOS } from './lib/panelModels'
import { criarProjetoExemplo, estadoVazio } from './lib/sample'
import { carregarEstado, salvarEstado } from './lib/storage'
import { reducer } from './lib/store'

type Passo = 'circuitos' | 'previa' | 'exportar'

const PASSOS: { id: Passo; rotulo: string; descricao: string; icono: string }[] = [
  { id: 'circuitos', rotulo: 'Circuitos', descricao: 'Monte o quadro', icono: 'grid' },
  { id: 'previa', rotulo: 'Prévia', descricao: 'Como vai sair', icono: 'eye' },
  { id: 'exportar', rotulo: 'PDF', descricao: 'Etiquetas + tabela', icono: 'download' },
]

export default function App() {
  const [estado, despachar] = useReducer(reducer, null, () => carregarEstado() ?? criarProjetoExemplo())
  const [passo, setPasso] = useState<Passo>('circuitos')
  const [aviso, setAviso] = useState<AvisoType | null>(null)

  useEffect(() => {
    salvarEstado(estado)
  }, [estado])

  const avisar = useCallback((proxima: AvisoType) => {
    setAviso(proxima)
  }, [])

  useEffect(() => {
    if (!aviso) return
    const id = setTimeout(() => setAviso(null), 2800)
    return () => clearTimeout(id)
  }, [aviso])

  const marcas = useMemo(() => {
    const unicas = new Set(MODELOS.map((modelo) => modelo.marca))
    return [...unicas]
  }, [])

  const { circuitos } = estado.projeto
  const indicePasso = PASSOS.findIndex((p) => p.id === passo)

  function confirmarReset() {
    const ok = window.confirm(
      'Isso apaga todos os circuitos deste projeto. Não dá para desfazer. Quer continuar?',
    )
    if (ok) despachar({ tipo: 'limpar' })
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="marca">
          <span className="marca-icone">
            <Icone nome="bolt" />
          </span>
          <span className="marca-texto">
            Quadro Identificado
            <small>Etiqueta de quadro elétrico</small>
          </span>
        </div>

        <nav className="nav-lateral" aria-label="Etapas">
          {PASSOS.map((item, indice) => (
            <button
              key={item.id}
              type="button"
              aria-current={passo === item.id ? 'step' : undefined}
              onClick={() => setPasso(item.id)}
            >
              <span className="nav-icone">
                <Icone nome={item.icono} />
              </span>
              <span className="nav-rotulo">
                <b>{item.rotulo}</b>
                <small>{item.descricao}</small>
              </span>
              <span className="nav-numero">
                {String(indice + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-rodape" aria-hidden="true">
          <span>
            Passo {Math.max(indicePasso, 0) + 1} de {PASSOS.length}
          </span>
          <span className="progresso">
            <em style={{ width: `${((Math.max(indicePasso, 0) + 1) / PASSOS.length) * 100}%` }} />
          </span>
        </div>
      </aside>

      <div className="conteudo">
        <header className="topo">
          <div className="topo-marca">
            <Icone nome="bolt" />
            <span>Quadro Identificado</span>
          </div>
          <span className="topo-etapa">
            Etapa {Math.max(indicePasso, 0) + 1} de {PASSOS.length}
          </span>
        </header>

        <main className="painel">
        {passo === 'circuitos' && (
          <>
            <div className="cabecalho-secao">
              <h1>Monte o quadro</h1>
              <p>
                Informe o projeto, escolha o modelo do quadro e cadastre os circuitos. A cor e o ícone de cada
                etiqueta saem do tipo de circuito automaticamente.
              </p>
            </div>

            <div className="grade-duas" style={{ marginBottom: 18 }}>
              <div className="cartao">
                <h2>
                  <Icone nome="file" />
                  Projeto
                </h2>
                <p className="dica">Aparece no cabeçalho do PDF e no nome do arquivo.</p>

                <div className="linha-campos">
                  <div className="campo">
                    <label className="rotulo" htmlFor="nome">
                      Nome do projeto
                    </label>
                    <input
                      id="nome"
                      type="text"
                      value={estado.projeto.nome}
                      maxLength={60}
                      placeholder="Residência do João"
                      onChange={(evento) => despachar({ tipo: 'definirNome', nome: evento.target.value })}
                    />
                  </div>
                  <div className="campo">
                    <label className="rotulo" htmlFor="cliente">
                      Cliente
                    </label>
                    <input
                      id="cliente"
                      type="text"
                      value={estado.projeto.cliente}
                      maxLength={60}
                      placeholder="Opcional"
                      onChange={(evento) => despachar({ tipo: 'definirCliente', cliente: evento.target.value })}
                    />
                  </div>
                </div>

                <div className="barra-acoes" style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-neutro btn-pequeno"
                    onClick={() => {
                      despachar({ tipo: 'substituirTudo', estado: criarProjetoExemplo() })
                      avisar({ texto: 'Projeto de exemplo carregado.' })
                    }}
                  >
                    <Icone nome="sparkles" />
                    Carregar exemplo
                  </button>
                  <button
                    type="button"
                    className="btn btn-neutro btn-pequeno"
                    onClick={confirmarReset}
                    disabled={circuitos.length === 0}
                  >
                    <Icone nome="trash" />
                    Limpar circuitos
                  </button>
                  <button
                    type="button"
                    className="btn btn-neutro btn-pequeno"
                    onClick={() => despachar({ tipo: 'substituirTudo', estado: estadoVazio() })}
                  >
                    <Icone nome="plus" />
                    Começar do zero
                  </button>
                </div>
              </div>

              <SeletorQuadro
                selecionado={estado.projeto.modelo}
                aoEscolher={(modelo) => despachar({ tipo: 'definirModelo', modelo })}
                circuitosUsados={circuitos.length}
                marcas={marcas}
              />
            </div>

            <ListaCircuitos estado={estado} despachar={despachar} />
          </>
        )}

        {passo === 'previa' && (
          <>
            <div className="cabecalho-secao">
              <h1>Veja como vai sair</h1>
              <p>
                A prévia usa exatamente a geometria do PDF: 17,5 × 12 mm, com a barra colorida, o ícone do circuito e o
                ambiente.
              </p>
            </div>
            <Previa estado={estado} />
          </>
        )}

        {passo === 'exportar' && (
          <>
            <div className="cabecalho-secao">
              <h1>Gere o PDF</h1>
              <p>Etiquetas e tabela no mesmo arquivo, já no tamanho de cola.</p>
            </div>
            <Exportar estado={estado} despachar={despachar} avisar={avisar} />
          </>
        )}
      </main>

        <nav className="nav-inferior" aria-label="Etapas">
          {PASSOS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={passo === item.id ? 'step' : undefined}
              onClick={() => setPasso(item.id)}
            >
              <Icone nome={item.icono} />
              <span>{item.rotulo}</span>
            </button>
          ))}
        </nav>
      </div>

      <Aviso aviso={aviso} />
    </div>
  )
}
