import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, DisponibilidadeQuarto } from '@/services/api'
import { tipoLabel, identificacaoQuarto } from '@/lib/quarto'

const iso = (d: Date) => d.toISOString().slice(0, 10)
const hoje = new Date()
const primeiroDia = iso(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
const ultimoDia = iso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0))

const cor: Record<string, string> = {
  DISPONIVEL: 'bg-green-100',
  OCUPADO: 'bg-red-100',
  RESERVADO: 'bg-amber-100',
}

function LegendaItem({ c, label }: { c: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <span className={`h-3 w-3 rounded-sm ${c}`} /> {label}
    </span>
  )
}

export default function Disponibilidade() {
  const [inicio, setInicio] = useState(primeiroDia)
  const [fim, setFim] = useState(ultimoDia)
  const [dados, setDados] = useState<DisponibilidadeQuarto[]>([])
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const verificar = () => {
    setErro(''); setLoading(true)
    api.quartos.disponibilidade(inicio, fim)
      .then(setDados)
      .catch(e => setErro(e instanceof Error ? e.message : 'Erro ao carregar disponibilidade.'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { verificar() }, [])

  const diasHeader = dados[0]?.dias ?? []

  return (
    <div className="space-y-4">
      {/* período */}
      <Card className="p-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Período</Label>
          <Input type="date" value={inicio} onChange={e => setInicio(e.target.value)} className="w-40" />
        </div>
        <span className="pb-2 text-sm text-muted-foreground">até</span>
        <div className="space-y-1">
          <Label className="text-xs">&nbsp;</Label>
          <Input type="date" value={fim} onChange={e => setFim(e.target.value)} className="w-40" />
        </div>
        <Button onClick={verificar} disabled={loading}>{loading ? 'Carregando...' : 'Verificar período'}</Button>
      </Card>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {/* legenda */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Legenda:</span>
        <LegendaItem c={cor.DISPONIVEL} label="Disponível" />
        <LegendaItem c={cor.OCUPADO} label="Ocupado" />
        <LegendaItem c={cor.RESERVADO} label="Reservado" />
      </div>

      {/* grade */}
      <Card className="p-0 overflow-x-auto">
        {dados.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">Nenhum quarto para exibir.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 bg-card px-4 py-2 text-left text-xs font-medium text-muted-foreground min-w-[140px]">Quarto</th>
                {diasHeader.map(d => (
                  <th key={d.dia} className="px-1 py-2 text-center text-[10px] font-medium text-muted-foreground">
                    {d.dia.slice(8, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.map(q => (
                <tr key={q.quartoId} className="border-b border-border/60">
                  <td className="sticky left-0 bg-card px-4 py-2">
                    <p className="text-sm font-medium whitespace-nowrap">{identificacaoQuarto({ id: q.quartoId, tipo: q.tipo })}</p>
                    <p className="text-xs text-muted-foreground">{tipoLabel[q.tipo]}</p>
                  </td>
                  {q.dias.map(d => (
                    <td key={d.dia} className="px-0.5 py-2">
                      <div className={`h-7 w-6 rounded-sm ${cor[d.status] ?? 'bg-gray-100'}`} title={`${d.dia.slice(8, 10)} — ${d.status}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
