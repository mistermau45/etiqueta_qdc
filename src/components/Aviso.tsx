import Icone from './Icone'

export interface Aviso {
  texto: string
  erro?: boolean
}

export default function Aviso({ aviso }: { aviso: Aviso | null }) {
  if (!aviso) return null
  return (
    <div className="toast" data-erro={aviso.erro ? 'true' : 'false'} role="status" aria-live="polite">
      <Icone nome={aviso.erro ? 'x' : 'check'} />
      {aviso.texto}
    </div>
  )
}
