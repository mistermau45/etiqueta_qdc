export type CircuitTypeId =
  | 'geral'
  | 'dr'
  | 'dps'
  | 'iluminacao'
  | 'tomadas'
  | 'tomada-especial'
  | 'cooktop'
  | 'chuveiro'
  | 'forno'
  | 'ar-condicionado'
  | 'tiragem'
  | 'bomba'
  | 'motores'
  | 'outros'

export interface CircuitType {
  id: CircuitTypeId
  label: string
  color: string
  icon: string
  suggestAria: string[]
}

export interface Circuit {
  id: string
  numero: string
  tipo: CircuitTypeId
  ambiente: string
  amperagem: string
}

export interface Projeto {
  nome: string
  cliente: string
  modelo: string
  circuitos: Circuit[]
}

export type MargemId = 'sem-margem' | '5mm' | '10mm'

export interface OpcoesEtiqueta {
  mostrarTabela: boolean
  margem: MargemId
}

export interface Ajustes {
  nome: string
  cliente: string
  modelo: string
  opcoes: OpcoesEtiqueta
}

export interface Estado {
  versao: number
  projeto: Projeto
  ajustes: Ajustes
}
