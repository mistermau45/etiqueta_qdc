import { MODELOS, type ModeloQuadro } from '../lib/panelModels'
import Icone from './Icone'

interface Props {
  selecionado: string
  aoEscolher: (modelo: string) => void
  circuitosUsados: number
  marcas: string[]
}

export default function SeletorQuadro({ selecionado, aoEscolher, circuitosUsados, marcas }: Props) {
  const modeloAtual = MODELOS.find((modelo) => modelo.id === selecionado) ?? MODELOS[0]
  const excedeu = circuitosUsados > modeloAtual.circuitos

  return (
    <div className="cartao">
      <h2>
        <Icone nome="shield" />
        Modelo do quadro
      </h2>
      <p className="dica">Escolha a marca e a quantidade de disjuntores do quadro que você vai identificar.</p>

      <div className="grade-modelos" role="group" aria-label="Modelo do quadro">
        {marcas.map((marca) => (
          <div key={marca} style={{ display: 'contents' }}>
            {MODELOS.filter((modelo) => modelo.marca === marca).map((modelo) => (
              <ModeloChip
                key={modelo.id}
                modelo={modelo}
                ativo={modelo.id === selecionado}
                aoEscolher={aoEscolher}
              />
            ))}
          </div>
        ))}
      </div>

      {excedeu && (
        <p className="aviso-limite">
          Você tem {circuitosUsados} circuitos e este quadro comporta {modeloAtual.circuitos}. Troque o modelo ou
          reduza a quantidade — o PDF sai igual, mas a etiqueta não vai caber no quadro.
        </p>
      )}
    </div>
  )
}

function ModeloChip({
  modelo,
  ativo,
  aoEscolher,
}: {
  modelo: ModeloQuadro
  ativo: boolean
  aoEscolher: (id: string) => void
}) {
  return (
    <button
      type="button"
      className="modelo-chip"
      aria-pressed={ativo}
      onClick={() => aoEscolher(modelo.id)}
    >
      <strong>{modelo.nome}</strong>
      <span>
        {modelo.marca}
        {modelo.trifasico ? ' · trifásico' : ''}
      </span>
    </button>
  )
}
