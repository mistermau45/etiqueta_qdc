import { useEffect, useId, useRef, useState } from 'react'
import { parseLista } from '../lib/parser'
import Icone from './Icone'

interface Props {
  aoAdicionar: (texto: string) => void
}

const EXEMPLOS = [
  'GERAL | geral | Quadro | 63 A',
  '1 | iluminacao | Sala, Hall | 10 A',
  '2 | tomadas | Cozinha | 20 A',
  '3 tomada bedroom 10A',
]

export default function ColarLista({ aoAdicionar }: Props) {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const idTextarea = useId()
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const aoClicarFora = (evento: PointerEvent) => {
      if (!caixa.current?.contains(evento.target as Node)) setAberto(false)
    }
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAberto(false)
    }
    document.addEventListener('pointerdown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('pointerdown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  const quantidade = parseLista(texto).length

  function confirmar() {
    if (quantidade === 0) {
      setErro('Não encontrei nenhuma linha. Comece com o número do circuito.')
      return
    }
    aoAdicionar(texto)
    setTexto('')
    setErro(null)
    setAberto(false)
  }

  return (
    <div ref={caixa} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-neutro btn-pequeno"
        onClick={() => setAberto((valor) => !valor)}
        aria-expanded={aberto}
      >
        <Icone nome="upload" />
        Colar lista
      </button>

      {aberto && (
        <div className="modal-fundo" onPointerDown={() => setAberto(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="colar-titulo"
            onPointerDown={(evento) => evento.stopPropagation()}
          >
            <h2 id="colar-titulo">Colar lista de circuitos</h2>
            <p>
              Uma linha por circuito, no formato <code>número | tipo | ambiente | corrente</code>. Só o número é
              obrigatório — o resto é opcional.
            </p>

            <label className="sr-only" htmlFor={idTextarea}>
              Lista de circuitos
            </label>
            <textarea
              id={idTextarea}
              value={texto}
              autoFocus
              spellCheck={false}
              placeholder={EXEMPLOS.join('\n')}
              onChange={(evento) => {
                setTexto(evento.target.value)
                setErro(null)
              }}
            />

            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>
                {quantidade > 0 ? `${quantidade} ${quantidade === 1 ? 'circuito lido' : 'circuitos lidos'}` : 'Cole as linhas acima'}
              </span>
              <button
                type="button"
                className="btn btn-neutro btn-pequeno"
                onClick={() => setTexto(EXEMPLOS.join('\n'))}
                style={{ marginLeft: 'auto' }}
              >
                Usar exemplo
              </button>
            </div>

            {erro && (
              <p className="aviso" style={{ color: 'var(--red)', fontWeight: 600 }}>
                {erro}
              </p>
            )}

            <div className="modal-acoes">
              <button type="button" className="btn btn-neutro" onClick={() => setAberto(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primario" onClick={confirmar} disabled={quantidade === 0}>
                <Icone nome="plus" />
                Adicionar {quantidade > 0 ? `${quantidade}` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
