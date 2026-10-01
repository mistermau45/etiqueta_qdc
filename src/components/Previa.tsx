import { getCircuitType } from '../lib/circuitTypes'
import { getModelo } from '../lib/panelModels'
import { A4, ETIQUETA, MARGEM_PADRAO } from '../lib/pdf/layout'
import type { Estado } from '../lib/types'
import Etiqueta from './Etiqueta'
import Icone from './Icone'

interface Props {
  estado: Estado
}

export default function Previa({ estado }: Props) {
  const { circuitos } = estado.projeto
  const modelo = getModelo(estado.projeto.modelo)
  const margem = MARGEM_PADRAO[estado.ajustes.opcoes.margem] ?? 0

  const colunas = Math.max(1, Math.floor((A4.largura - margem * 2) / ETIQUETA.largura))
  const linhas = Math.max(1, Math.floor((A4.altura - margem * 2 - 22) / ETIQUETA.altura))
  const porPagina = colunas * linhas
  const paginas = circuitos.length > 0 ? Math.ceil(circuitos.length / porPagina) : 0

  return (
    <div className="grade-duas">
      <div className="cartao">
        <h2>
          <Icone nome="print" />
          Faixa de etiquetas
        </h2>
        <p className="dica">
          {circuitos.length === 0
            ? 'Assim que você cadastrar os circuitos, a faixa aparece aqui.'
            : `${circuitos.length} etiquetas em ${paginas} ${paginas === 1 ? 'folha' : 'folhas'} A4 de 17,5 × 30 mm.`}
        </p>

        {circuitos.length === 0 ? (
          <div className="vazio">
            <strong>Sem etiquetas ainda</strong>
            Vá em <b>Circuitos</b> e monte a lista do quadro.
          </div>
        ) : (
          <div className="faixa-etiquetas">
            {circuitos.map((circuito) => (
              <Etiqueta key={circuito.id} circuito={circuito} />
            ))}
          </div>
        )}
      </div>

      <div className="cartao">
        <h2>
          <Icone nome="file" />
          Tabela da porta
        </h2>
        <p className="dica">
          A mesma informação em texto, para colar do lado da porta do quadro ou guardar com a documentação.
        </p>

        {circuitos.length === 0 ? (
          <div className="vazio">
            <strong>Sem tabela ainda</strong>
            Ela é gerada automaticamente junto com as etiquetas.
          </div>
        ) : (
          <div className="rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Circ.</th>
                  <th>Tipo</th>
                  <th>Ambiente / local</th>
                  <th>Corrente</th>
                </tr>
              </thead>
              <tbody>
                {circuitos.map((circuito) => {
                  const tipo = getCircuitType(circuito.tipo)
                  return (
                    <tr key={circuito.id}>
                      <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        <span className="marca-cor" style={{ '--cor': tipo.color } as React.CSSProperties} />
                        {circuito.numero}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{tipo.label}</td>
                      <td>{circuito.ambiente || '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{circuito.amperagem || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="aviso">
          Quadro: {modelo.marca} · {modelo.nome}
          {circuitos.length > modelo.circuitos && ` · ${circuitos.length - modelo.circuitos} acima do limite do quadro`}
        </p>
      </div>
    </div>
  )
}
