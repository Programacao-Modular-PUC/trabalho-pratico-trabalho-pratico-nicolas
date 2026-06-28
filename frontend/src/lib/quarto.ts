import { Quarto } from '@/services/api'

export const tipoLabel: Record<string, string> = {
  INDIVIDUAL: 'Individual',
  CASAL: 'Casal',
  FAMILIA: 'Família',
}

// Foto de fallback por tipo, usada quando o quarto não tem imagens cadastradas.
const fallbackPorTipo: Record<string, string> = {
  INDIVIDUAL: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&q=80',
  CASAL: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1000&q=80',
  FAMILIA: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80',
}

/** Sempre retorna ao menos uma imagem (fallback por tipo se a galeria estiver vazia). */
export function imagensDoQuarto(q: Quarto): string[] {
  if (q.imagens && q.imagens.length > 0) return q.imagens
  return [fallbackPorTipo[q.tipo ?? 'INDIVIDUAL'] ?? fallbackPorTipo.INDIVIDUAL]
}

export function brl(valor: number | undefined): string {
  return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Identificação curta do quarto, ex.: "Casal #02". */
export function identificacaoQuarto(q: Pick<Quarto, 'id' | 'tipo'>): string {
  const num = q.id != null ? `#${String(q.id).padStart(2, '0')}` : ''
  return `${tipoLabel[q.tipo ?? ''] ?? q.tipo ?? 'Quarto'} ${num}`.trim()
}

/** Resumo curto das características específicas do tipo, para os cards. */
export function detalhesQuarto(q: Quarto): string {
  if (q.tipo === 'INDIVIDUAL') return `${q.numeroCamas ?? 1} cama(s) · ${q.limiteHospedes ?? 1} hóspede(s)`
  if (q.tipo === 'CASAL') return `${q.tipoCama ?? 'Casal'}${q.possuiBerco ? ' · com berço' : ''}`
  if (q.tipo === 'FAMILIA') return `${q.numeroHospedes ?? 0} hóspedes · ${q.quantidadeAmbientes ?? 1} ambiente(s)`
  return ''
}
