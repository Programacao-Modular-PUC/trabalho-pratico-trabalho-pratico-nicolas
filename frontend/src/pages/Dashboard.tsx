import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api, Aluguel, Residencia } from '@/services/api'
import { situacaoBadge } from '@/lib/aluguel'
import { brl } from '@/lib/quarto'

function StatCard({ label, value, sub, dotColor }: { label: string; value: string; sub: string; dotColor: string }) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{label}</CardTitle>
          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

const fmt = (dt: string) => new Date(dt).toLocaleDateString('pt-BR')
const ehHoje = (dt: string) => new Date(dt).toDateString() === new Date().toDateString()

export default function Dashboard() {
  const navigate = useNavigate()
  const [alugueis, setAlugueis] = useState<Aluguel[]>([])
  const [residencias, setResidencias] = useState<Residencia[]>([])
  const [totalQuartos, setTotalQuartos] = useState(0)
  const [disponiveis, setDisponiveis] = useState(0)

  useEffect(() => {
    api.residencias.listar().then(setResidencias).catch(() => {})
    api.quartos.listar(undefined, 0, 1000).then(q => {
      setTotalQuartos(q.totalElements)
      setDisponiveis(q.content.filter(x => x.statusAtual === 'DISPONIVEL').length)
    }).catch(() => {})
    api.alugueis.listar(0, 200).then(res => setAlugueis(res.content)).catch(() => {})
  }, [])

  const naoCancelados = alugueis.filter(a => a.situacao !== 'CANCELADO')
  const ativos = alugueis.filter(a => a.situacao === 'ATIVO')
  const saemHoje = ativos.filter(a => ehHoje(a.dataSaida)).length
  const receita = naoCancelados.reduce((s, a) => s + (a.valorFinal ?? 0), 0)
  const recentes = [...alugueis].reverse().slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <StatCard label="Residências" value={String(residencias.length)} sub="cadastradas no sistema" dotColor="bg-gray-900" />
        <StatCard label="Quartos Disponíveis" value={String(disponiveis)} sub={`de ${totalQuartos} no total`} dotColor="bg-green-500" />
        <StatCard label="Aluguéis Ativos" value={String(ativos.length)} sub={saemHoje > 0 ? `${saemHoje} saem hoje` : 'em andamento'} dotColor="bg-amber-500" />
        <StatCard label="Receita Total" value={brl(receita)} sub="soma dos aluguéis" dotColor="bg-gray-900" />
      </div>

      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader>
            <div>
              <p className="font-semibold text-sm text-foreground">Aluguéis Recentes</p>
              <p className="text-xs text-muted-foreground mt-0.5">Últimas movimentações</p>
            </div>
          </CardHeader>
          <div className="border-t border-border" />
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Cliente</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Entrada</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Saída</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Valor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentes.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-xs text-muted-foreground">Nenhum aluguel encontrado</td></tr>
                )}
                {recentes.map((a, i) => {
                  const badge = situacaoBadge(a)
                  return (
                    <tr key={a.id ?? i} className={i % 2 === 0 ? 'bg-secondary/30' : ''}>
                      <td className="px-4 py-2.5">{a.cliente?.nome ?? '—'}</td>
                      <td className="px-4 py-2.5">{fmt(a.dataEntrada)}</td>
                      <td className="px-4 py-2.5">{fmt(a.dataSaida)}</td>
                      <td className="px-4 py-2.5">{brl(a.valorFinal)}</td>
                      <td className="px-4 py-2.5"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="w-64 shrink-0">
          <CardHeader>
            <p className="font-semibold text-sm text-foreground">Ações Rápidas</p>
          </CardHeader>
          <div className="border-t border-border" />
          <CardContent className="p-4 space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/residencias')}>+ Nova Residência</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/clientes')}>+ Novo Cliente</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/alugueis/novo')}>+ Novo Aluguel</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/historico')}>↗ Ver Relatório</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
