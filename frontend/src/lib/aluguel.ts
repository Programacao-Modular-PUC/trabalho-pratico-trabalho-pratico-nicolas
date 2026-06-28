import { Aluguel } from '@/services/api'

type BadgeVariant = 'ativo' | 'encerrado' | 'pendente'

/** Mapeia a situação derivada do aluguel para rótulo + variante de badge. */
export function situacaoBadge(a: Aluguel): { label: string; variant: BadgeVariant } {
  switch (a.situacao) {
    case 'ATIVO': return { label: 'Ativo', variant: 'ativo' }
    case 'RESERVADO': return { label: 'Reservado', variant: 'pendente' }
    case 'ENCERRADO': return { label: 'Encerrado', variant: 'encerrado' }
    case 'CANCELADO': return { label: 'Cancelado', variant: 'encerrado' }
    default: return { label: a.status ?? '—', variant: 'encerrado' }
  }
}

/** Calcula o número de diárias replicando a regra do backend (entrada às 12h; saída ≥ 12h soma diária). */
export function calcularDiarias(dataEntrada: string, dataSaida: string): number {
  const ent = new Date(dataEntrada)
  const sai = new Date(dataSaida)
  const msDia = 1000 * 60 * 60 * 24
  const d0 = new Date(ent.getFullYear(), ent.getMonth(), ent.getDate())
  const d1 = new Date(sai.getFullYear(), sai.getMonth(), sai.getDate())
  let dias = Math.round((d1.getTime() - d0.getTime()) / msDia)
  if (sai.getHours() >= 12) dias++
  return Math.max(1, dias)
}
