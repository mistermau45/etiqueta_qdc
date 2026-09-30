export interface ModeloQuadro {
  id: string
  nome: string
  marca: string
  circuitos: number
  trifasico: boolean
}

export const MODELOS: ModeloQuadro[] = [
  { id: 'custom', nome: 'Personalizado', marca: 'Qualquer', circuitos: 24, trifasico: false },
  { id: 'weg-24', nome: '24 disjuntores', marca: 'WEG', circuitos: 24, trifasico: false },
  { id: 'weg-30', nome: '30 disjuntores', marca: 'WEG', circuitos: 30, trifasico: false },
  { id: 'weg-46', nome: '46 disjuntores', marca: 'WEG', circuitos: 46, trifasico: false },
  { id: 'weg-60', nome: '60 disjuntores', marca: 'WEG', circuitos: 60, trifasico: false },
  { id: 'schneider-24', nome: '24 disjuntores', marca: 'Schneider', circuitos: 24, trifasico: false },
  { id: 'schneider-46', nome: '46 disjuntores', marca: 'Schneider', circuitos: 46, trifasico: false },
  { id: 'abb-24', nome: '24 disjuntores', marca: 'ABB', circuitos: 24, trifasico: false },
  { id: 'abb-44', nome: '44 disjuntores', marca: 'ABB', circuitos: 44, trifasico: false },
  { id: 'siemens-24', nome: '24 disjuntores', marca: 'Siemens', circuitos: 24, trifasico: false },
  { id: 'hager-24', nome: '24 disjuntores', marca: 'Hager', circuitos: 24, trifasico: false },
  { id: 'britamax-24', nome: '24 disjuntores', marca: 'Britamax', circuitos: 24, trifasico: false },
  { id: 'eletric-24', nome: '24 disjuntores', marca: 'Eletric', circuitos: 24, trifasico: false },
  { id: 'tramontina-40', nome: '40 disjuntores', marca: 'Tramontina', circuitos: 40, trifasico: false },
  { id: 'margem-12', nome: '12 disjuntores', marca: 'Margem', circuitos: 12, trifasico: false },
  { id: 'unibox-40', nome: '40 disjuntores', marca: 'Unibox', circuitos: 40, trifasico: false },
  { id: 'atlas-24', nome: '24 disjuntores', marca: 'Atlas', circuitos: 24, trifasico: false },
  { id: 'caixa-2', nome: 'Quadro de embutir 2 módulos', marca: 'Genérico', circuitos: 2, trifasico: false },
  { id: 'caixa-4', nome: 'Caixa de passagem 4 módulos', marca: 'Genérico', circuitos: 4, trifasico: false },
  { id: 'trifasico-12', nome: 'Trifásico 12', marca: 'Genérico', circuitos: 12, trifasico: true },
  { id: 'trifasico-18', nome: 'Trifásico 18', marca: 'Genérico', circuitos: 18, trifasico: true },
  { id: 'trifasico-24', nome: 'Trifásico 24', marca: 'Genérico', circuitos: 24, trifasico: true },
]

export function getModelo(id: string): ModeloQuadro {
  return MODELOS.find((modelo) => modelo.id === id) ?? MODELOS[0]
}
