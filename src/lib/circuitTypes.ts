import type { CircuitType, CircuitTypeId } from './types'

export const CIRCUIT_TYPES: CircuitType[] = [
  {
    id: 'geral',
    label: 'Geral',
    color: '#c8202e',
    icon: 'power',
    suggestAria: ['Quadro', 'Entrada', 'Alimentação'],
  },
  {
    id: 'dr',
    label: 'DR — Diferencial',
    color: '#db2777',
    icon: 'dr',
    suggestAria: ['Diferencial geral', 'Banheiro', 'Tomadas externas'],
  },
  {
    id: 'dps',
    label: 'DPS — Surto',
    color: '#0891b2',
    icon: 'dps',
    suggestAria: ['Entrada', 'Proteção de surtos', 'Quadro geral'],
  },
  {
    id: 'iluminacao',
    label: 'Iluminação',
    color: '#e88016',
    icon: 'light',
    suggestAria: ['Sala, Hall', 'Quartos', 'Cozinha', 'Corredor'],
  },
  {
    id: 'tomadas',
    label: 'Tomadas',
    color: '#2d9149',
    icon: 'socket',
    suggestAria: ['Sala', 'Quartos', 'Cozinha', 'Banheiro'],
  },
  {
    id: 'tomada-especial',
    label: 'Tomada especial',
    color: '#0f9c86',
    icon: 'plug',
    suggestAria: ['Bancada', 'Área de serviço', 'Garagem'],
  },
  {
    id: 'cooktop',
    label: 'Cooktop',
    color: '#913ca2',
    icon: 'cooktop',
    suggestAria: ['Cozinha'],
  },
  {
    id: 'chuveiro',
    label: 'Chuveiro',
    color: '#2474b8',
    icon: 'shower',
    suggestAria: ['Suíte', 'Banheiro'],
  },
  {
    id: 'forno',
    label: 'Forno',
    color: '#8a6d1f',
    icon: 'spark',
    suggestAria: ['Cozinha'],
  },
  {
    id: 'ar-condicionado',
    label: 'Ar-condicionado',
    color: '#3f7d4a',
    icon: 'wind',
    suggestAria: ['Sala', 'Quarto', 'Escritório'],
  },
  {
    id: 'tiragem',
    label: 'Tiragem / Exaustor',
    color: '#6b7280',
    icon: 'arrow',
    suggestAria: ['Cozinha', 'Banheiro'],
  },
  {
    id: 'bomba',
    label: 'Bomba',
    color: '#1668a8',
    icon: 'water',
    suggestAria: ['Água fria', 'Água quente', 'Poço'],
  },
  {
    id: 'motores',
    label: 'Motores',
    color: '#4b5563',
    icon: 'gear',
    suggestAria: ['Portão', 'Garagem', 'Roll'],
  },
  {
    id: 'outros',
    label: 'Outros',
    color: '#5b6271',
    icon: 'check',
    suggestAria: ['Reserva'],
  },
]

const BY_ID = new Map<CircuitTypeId, CircuitType>(
  CIRCUIT_TYPES.map((type) => [type.id, type]),
)

export function getCircuitType(id: CircuitTypeId): CircuitType {
  return BY_ID.get(id) ?? BY_ID.get('outros')!
}

export function circuitColor(id: CircuitTypeId): string {
  return getCircuitType(id).color
}

export function circuitIcon(id: CircuitTypeId): string {
  return getCircuitType(id).icon
}
