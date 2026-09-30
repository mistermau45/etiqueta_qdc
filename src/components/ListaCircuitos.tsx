import { CIRCUIT_TYPES, getCircuitType } from '../lib/circuitTypes'
import type { Acao } from '../lib/store'
import type { Circuit, CircuitTypeId, Estado } from '../lib/types'
import Icone from './Icone'
import ColarLista from './ColarLista'

interface Props {
  estado: Estado
  despachar: (acao: Acao) => void
}

export default function ListaCircuitos({ estado, despachar }: Props) {
  const { circuitos } = estado.projeto

  return (
    <div className="cartao">
      <h2>
        <Icone nome="list" />
        Circuitos do quadro
      </h2>
      <p className="dica">
        Um circuito por disjuntor. A cor e o ícone saem do tipo — você só informa o número e o ambiente.
      </p>

      <div className="barra-circuitos">
        <button
          type="button"
          className="btn btn-secundario btn-pequeno"
          onClick={() => despachar({ tipo: 'addCircuito' })}
          disabled={circuitos.length >= 64}
        >
          <Icone nome="plus" />
          Adicionar
        </button>
        <button
          type="button"
          className="btn btn-neutro btn-pequeno"
          onClick={() => despachar({ tipo: 'renumerar' })}
          disabled={circuitos.length === 0}
        >
          <Icone nome="reset" />
          Renumerar
        </button>
        <ColarLista aoAdicionar={(texto) => despachar({ tipo: 'importarLista', texto })} />
        {circuitos.length > 0 && (
          <span className="contagem">
            {circuitos.length} {circuitos.length === 1 ? 'circuito' : 'circuitos'}
          </span>
        )}
      </div>

      {circuitos.length === 0 ? (
        <div className="vazio">
          <strong>Nenhum circuito ainda</strong>
          Toque em <b>Adicionar</b> para começar, ou use <b>Colar lista</b> para trazer tudo de uma vez.
        </div>
      ) : (
        <div className="lista-circuitos">
          {circuitos.map((circuito, indice) => (
            <LinhaCircuito
              key={circuito.id}
              circuito={circuito}
              primeiro={indice === 0}
              ultimo={indice === circuitos.length - 1}
              despachar={despachar}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LinhaCircuito({
  circuito,
  primeiro,
  ultimo,
  despachar,
}: {
  circuito: Circuit
  primeiro: boolean
  ultimo: boolean
  despachar: (acao: Acao) => void
}) {
  const tipo = getCircuitType(circuito.tipo)

  const alterar = (dados: Partial<Circuit>) =>
    despachar({ tipo: 'atualizarCircuito', id: circuito.id, dados })

  return (
    <div className="circuito" style={{ '--cor': tipo.color } as React.CSSProperties}>
      <input
        type="text"
        value={circuito.numero}
        onChange={(evento) => alterar({ numero: evento.target.value })}
        aria-label={`Número do circuito ${circuito.numero || '(sem número)'}`}
        maxLength={6}
        style={{ fontWeight: 700 }}
      />

      <select
        value={circuito.tipo}
        onChange={(evento) => alterar({ tipo: evento.target.value as CircuitTypeId })}
        aria-label={`Tipo do circuito ${circuito.numero || ''}`}
      >
        {CIRCUIT_TYPES.map((opcao) => (
          <option key={opcao.id} value={opcao.id}>
            {opcao.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={circuito.ambiente}
        onChange={(evento) => alterar({ ambiente: evento.target.value })}
        placeholder="Sala, Hall"
        aria-label={`Ambiente do circuito ${circuito.numero || ''}`}
        maxLength={40}
        list={`ambientes-${circuito.tipo}`}
      />

      <input
        type="text"
        value={circuito.amperagem}
        onChange={(evento) => alterar({ amperagem: evento.target.value })}
        placeholder="20 A"
        aria-label={`Corrente do circuito ${circuito.numero || ''}`}
        maxLength={10}
      />

      <div className="circuito-acoes">
        <button
          type="button"
          className="icone-btn"
          title="Subir"
          aria-label={`Subir o circuito ${circuito.numero || ''}`}
          disabled={primeiro}
          onClick={() => despachar({ tipo: 'moverCircuito', id: circuito.id, direcao: -1 })}
        >
          <Icone nome="up" />
        </button>
        <button
          type="button"
          className="icone-btn"
          title="Descer"
          aria-label={`Descer o circuito ${circuito.numero || ''}`}
          disabled={ultimo}
          onClick={() => despachar({ tipo: 'moverCircuito', id: circuito.id, direcao: 1 })}
        >
          <Icone nome="down" />
        </button>
        <button
          type="button"
          className="icone-btn"
          title="Duplicar"
          aria-label={`Duplicar o circuito ${circuito.numero || ''}`}
          onClick={() => despachar({ tipo: 'duplicarCircuito', id: circuito.id })}
        >
          <Icone nome="copy" />
        </button>
        <button
          type="button"
          className="icone-btn perigo"
          title="Remover"
          aria-label={`Remover o circuito ${circuito.numero || ''}`}
          onClick={() => despachar({ tipo: 'removerCircuito', id: circuito.id })}
        >
          <Icone nome="trash" />
        </button>
      </div>

      <datalist id={`ambientes-${circuito.tipo}`}>
        {tipo.suggestAria.map((sugestao) => (
          <option key={sugestao} value={sugestao} />
        ))}
      </datalist>
    </div>
  )
}
