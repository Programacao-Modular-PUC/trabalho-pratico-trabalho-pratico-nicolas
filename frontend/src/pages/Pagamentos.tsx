import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Receipt } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pagination } from '@/components/Pagination'
import { api, Pagamento } from '@/services/api'
import { brl } from '@/lib/quarto'

const PAGE_SIZE = 10
const fmt = (dt?: string) => (dt ? new Date(dt).toLocaleString('pt-BR') : '—')
const formaLabel: Record<string, string> = { PIX: 'Pix', CARTAO: 'Cartão', DINHEIRO: 'Dinheiro' }

function statusBadge(status: Pagamento['status']) {
  if (status === 'CONFIRMADO') return <Badge variant="ativo">Confirmado</Badge>
  if (status === 'CANCELADO') return <Badge variant="encerrado">Cancelado</Badge>
  return <Badge variant="pendente">Pendente</Badge>
}

function Stat({ label, value, sub, cor }: { label: string; value: string; sub?: string; cor?: string }) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${cor ?? ''}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Pagamentos() {
  const [todos, setTodos] = useState<Pagamento[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [recibo, setRecibo] = useState<Pagamento | null>(null)

  const load = () => api.pagamentos.listar(0, 1000).then(r => setTodos(r.content)).catch(() => {})
  useEffect(() => { load() }, [])

  const confirmar = async (id: number) => {
    setErro(''); setLoading(id)
    try { await api.pagamentos.confirmar(id); await load() }
    catch (e: unknown) { setErro(e instanceof Error ? e.message : 'Erro ao confirmar pagamento.') }
    finally { setLoading(null) }
  }

  const confirmados = useMemo(() => todos.filter(p => p.status === 'CONFIRMADO'), [todos])
  const pendentes = useMemo(() => todos.filter(p => p.status === 'PENDENTE'), [todos])
  const receita = confirmados.reduce((s, p) => s + p.valorPago, 0)
  const emAberto = pendentes.reduce((s, p) => s + p.valorPago, 0)
  const ticket = confirmados.length ? receita / confirmados.length : 0

  const totalPages = Math.ceil(todos.length / PAGE_SIZE)
  const visiveis = todos.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Stat label="Receita Confirmada" value={brl(receita)} sub="pagamentos confirmados" cor="text-green-600" />
        <Stat label="Pagamentos Pendentes" value={String(pendentes.length)} sub={`${brl(emAberto)} em aberto`} cor="text-amber-600" />
        <Stat label="Pagamentos Confirmados" value={String(confirmados.length)} sub="quitados" />
        <Stat label="Ticket Médio" value={brl(ticket)} sub="por pagamento confirmado" />
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aluguel</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valor</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Forma</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data Pagamento</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum pagamento registrado</td></tr>
            )}
            {visiveis.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? '' : 'bg-secondary/20'}>
                <td className="px-4 py-3 text-muted-foreground">#{p.id}</td>
                <td className="px-4 py-3">{p.clienteNome ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.aluguelId ? `Aluguel #${p.aluguelId}` : '—'}</td>
                <td className="px-4 py-3 font-medium">{brl(p.valorPago)}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.formaPagamento ? formaLabel[p.formaPagamento] : '—'}</td>
                <td className="px-4 py-3">{fmt(p.dataPagamento)}</td>
                <td className="px-4 py-3">{statusBadge(p.status)}</td>
                <td className="px-4 py-3 text-right">
                  {p.status === 'PENDENTE' && (
                    <Button size="sm" onClick={() => confirmar(p.id!)} disabled={loading === p.id}>
                      <CheckCircle className="h-3.5 w-3.5" /> {loading === p.id ? 'Confirmando...' : 'Confirmar Pag.'}
                    </Button>
                  )}
                  {p.status === 'CONFIRMADO' && (
                    <Button size="sm" variant="outline" onClick={() => setRecibo(p)}>
                      <Receipt className="h-3.5 w-3.5" /> Ver recibo
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} totalElements={todos.length} onPageChange={setPage} />
      </Card>

      {/* Recibo */}
      <Dialog open={recibo !== null} onOpenChange={o => !o && setRecibo(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Recibo de Pagamento</DialogTitle></DialogHeader>
          {recibo && (
            <div className="space-y-3">
              <div className="rounded-lg border border-dashed border-border p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Recibo nº</span><span className="font-medium">#{recibo.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{recibo.clienteNome ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Aluguel</span><span className="font-medium">{recibo.aluguelId ? `#${recibo.aluguelId}` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Forma</span><span className="font-medium">{recibo.formaPagamento ? formaLabel[recibo.formaPagamento] : '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span className="font-medium">{fmt(recibo.dataPagamento)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <span className="font-semibold">Valor pago</span><span className="font-bold text-green-600">{brl(recibo.valorPago)}</span>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground">Pagamento confirmado — HospedaApp</p>
              <Button className="w-full" variant="outline" onClick={() => window.print()}>Imprimir</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
